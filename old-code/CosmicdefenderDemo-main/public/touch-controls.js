(function(){
	const BASE_W = 1280, BASE_H = 720;
	const dpr = Math.max(1, Math.min(window.devicePixelRatio || 1, 3));
	const isTouch = (matchMedia && matchMedia('(pointer: coarse)').matches) || (navigator.maxTouchPoints||0) > 0;
	const canvas = document.getElementById('gameCanvas');
	if (!canvas) return;

	function applyContainScale(){
		const vw = window.innerWidth;
		const vh = window.innerHeight;
		
		// Detectar si es dispositivo móvil
		const isMobile = /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent) || 
		                 (matchMedia && matchMedia('(pointer: coarse)').matches) || 
		                 (navigator.maxTouchPoints || 0) > 0;
		
		let scale;
		if (isMobile) {
			// En móvil: usar cover para llenar toda la pantalla
			scale = Math.max(vw/BASE_W, vh/BASE_H);
		} else {
			// En PC: usar contain para mantener proporción
			scale = Math.min(vw/BASE_W, vh/BASE_H);
		}
		
		const cssW = Math.round(BASE_W * scale);
		const cssH = Math.round(BASE_H * scale);
		canvas.style.width = cssW + 'px';
		canvas.style.height = cssH + 'px';
		canvas.width = Math.round(BASE_W * scale * dpr);
		canvas.height = Math.round(BASE_H * scale * dpr);
		
		const container = document.querySelector('.game-container');
		if (container) {
			if (isMobile) {
				// En móvil: forzar pantalla completa
				container.style.display = 'block';
				container.style.position = 'fixed';
				container.style.top = '0';
				container.style.left = '0';
				container.style.width = '100vw';
				container.style.height = '100vh';
				container.style.backgroundColor = '#000';
				container.style.overflow = 'hidden';
				// Centrar el canvas
				canvas.style.position = 'absolute';
				canvas.style.top = '50%';
				canvas.style.left = '50%';
				canvas.style.transform = 'translate(-50%, -50%)';
			} else {
				// En PC: mantener el comportamiento original
				container.style.display = 'grid';
				container.style.placeItems = 'center';
				container.style.backgroundColor = '#000';
				container.style.width = '100vw';
				container.style.height = '100vh';
				canvas.style.position = 'static';
				canvas.style.transform = 'none';
			}
		}
	}
	window.addEventListener('resize', applyContainScale, { passive: true });
	applyContainScale();

	if (!isTouch) return;

	// Build HUD elements
	const hud = document.createElement('div');
	hud.className = 'mobile-hud';
	hud.style.position = 'fixed';
	hud.style.inset = '0';
	hud.style.pointerEvents = 'none';
	hud.style.zIndex = '10002'; // Higher than skills widget (10001)
	document.body.appendChild(hud);

	// Joystick
	const joy = document.createElement('div');
	joy.className = 'hud-zone hud-joystick';
	joy.style.position = 'fixed';
	joy.style.left = '16px';
	joy.style.bottom = '16px';
	joy.style.width = '160px';
	joy.style.height = '160px';
	joy.style.borderRadius = '9999px';
	joy.style.background = 'rgba(255,255,255,0.06)';
	joy.style.pointerEvents = 'auto';
	hud.appendChild(joy);

	// Buttons
	function makeBtn(size){
		const b = document.createElement('div');
		b.className = 'hud-zone hud-button';
		b.style.width = size+'px';
		b.style.height = size+'px';
		b.style.borderRadius = '9999px';
		b.style.background = 'rgba(255,255,255,0.08)';
		b.style.pointerEvents = 'auto';
		return b;
	}
	const btnWrap = document.createElement('div');
	btnWrap.style.position = 'fixed';
	btnWrap.style.right = '16px';
	btnWrap.style.bottom = '16px';
	btnWrap.style.display = 'flex';
	btnWrap.style.flexDirection = 'column';
	btnWrap.style.gap = '12px';
	hud.appendChild(btnWrap);
	const fireBtn = makeBtn(72);
	const skill1 = makeBtn(56);
	const skill2 = makeBtn(56);
	const skill3 = makeBtn(56);
	btnWrap.appendChild(fireBtn);
	btnWrap.appendChild(skill1);
	btnWrap.appendChild(skill2);
	btnWrap.appendChild(skill3);

	// Helpers to synthesize events
	function dispatchKey(type, key){
		const e = new KeyboardEvent(type, { key, bubbles: true, cancelable: true });
		document.dispatchEvent(e);
	}
	function dispatchMouse(type, x, y){
		const rect = canvas.getBoundingClientRect();
		const e = new MouseEvent(type, { 
			clientX: x || (rect.left + rect.width*0.7), 
			clientY: y || (rect.top + rect.height*0.7), 
			bubbles: true, 
			cancelable: true, 
			buttons: 1 
		});
		canvas.dispatchEvent(e);
	}
	
	// Update mouse position for ship rotation
	function updateMousePosition(){
		if (!joyActive) return; // Always update rotation when joystick is active
		
		const rect = canvas.getBoundingClientRect();
		const centerX = rect.width / 2;  // Center relative to canvas
		const centerY = rect.height / 2; // Center relative to canvas
		
		// Calculate mouse position based on joystick direction
		const mouseDistance = Math.min(200, rect.width * 0.3); // Limit distance to canvas bounds
		const angle = Math.atan2(vec.y, vec.x);
		const mouseX = centerX + Math.cos(angle) * mouseDistance;
		const mouseY = centerY + Math.sin(angle) * mouseDistance;
		
		// Clamp coordinates to canvas bounds
		const clampedX = Math.max(0, Math.min(rect.width, mouseX));
		const clampedY = Math.max(0, Math.min(rect.height, mouseY));
		
		// Debug: Log direction info
		console.log(`Joystick: vec.x=${vec.x.toFixed(2)}, vec.y=${vec.y.toFixed(2)}, angle=${(angle * 180 / Math.PI).toFixed(1)}°`);
		console.log(`Mouse: x=${clampedX.toFixed(0)}, y=${clampedY.toFixed(0)}`);
		
		// Dispatch mousemove event with canvas-relative coordinates
		const e = new MouseEvent('mousemove', { 
			clientX: rect.left + clampedX, 
			clientY: rect.top + clampedY, 
			bubbles: true, 
			cancelable: true, 
			buttons: 1 
		});
		canvas.dispatchEvent(e);
	}

	// Joystick logic → Dual Zone Control (Always Rotate + Optional Movement)
	let joyActive = false; let center = { x: 0, y: 0 }; let vec = { x:0, y:0 };
	const TH = 0.35; // threshold for movement
	const ROTATION_ZONE = 0.5; // 50% of joystick radius for rotation only
	let was = { w:false, a:false, s:false, d:false };
	let isRotating = false; // Track if we're in rotation mode

	function updateKeys(){
		// Only apply movement if we're in the outer zone (beyond 50% radius)
		const distance = Math.hypot(vec.x, vec.y);
		const inMovementZone = distance > ROTATION_ZONE;
		
		// Always update rotation when joystick is active
		updateMousePosition();
		
		if (inMovementZone) {
			// Movement zone: Only W (forward) - ship moves in direction it's pointing
			const wantW = true; // Always move forward when in movement zone
			if (wantW !== was.w) { dispatchKey(wantW? 'keydown':'keyup', 'w'); was.w = wantW; }
			
			// Release other keys
			if (was.s) { dispatchKey('keyup', 's'); was.s = false; }
			if (was.a) { dispatchKey('keyup', 'a'); was.a = false; }
			if (was.d) { dispatchKey('keyup', 'd'); was.d = false; }
		} else {
			// Rotation only - release all movement keys
			if (was.w) { dispatchKey('keyup', 'w'); was.w = false; }
			if (was.s) { dispatchKey('keyup', 's'); was.s = false; }
			if (was.a) { dispatchKey('keyup', 'a'); was.a = false; }
			if (was.d) { dispatchKey('keyup', 'd'); was.d = false; }
		}
		
		// Update rotation state
		isRotating = distance > 0.1; // Small deadzone for rotation
	}
	let keyTimer = setInterval(updateKeys, 50);

	function onStart(ev){
		ev.preventDefault();
		joyActive = true;
		const t = (ev.touches? ev.touches[0]: ev);
		const r = joy.getBoundingClientRect();
		center = { x: r.left + r.width/2, y: r.top + r.height/2 };
		onMove(ev);
	}
	
	function onMove(ev){
		if (!joyActive) return;
		const t = (ev.touches? ev.touches[0]: ev);
		const dx = t.clientX - center.x;
		const dy = t.clientY - center.y;
		const radius = 70;
		let nx = dx / radius, ny = dy / radius;
		const len = Math.hypot(nx, ny) || 1;
		nx /= Math.max(1, len); ny /= Math.max(1, len);
		vec.x = Math.max(-1, Math.min(1, nx));
		vec.y = Math.max(-1, Math.min(1, ny));
		
		// Update visual feedback for dual zone
		const distance = Math.hypot(vec.x, vec.y);
		if (distance > ROTATION_ZONE) {
			joy.style.background = 'rgba(255,255,0,0.15)'; // Yellow for movement zone
			joy.classList.add('movement-zone', 'active');
		} else {
			joy.style.background = 'rgba(255,255,255,0.06)'; // White for rotation zone
			joy.classList.remove('movement-zone');
			joy.classList.add('active');
		}
	}
	
	function onEnd(){
		joyActive = false; 
		vec.x = 0; 
		vec.y = 0; 
		isRotating = false;
		joy.style.background = 'rgba(255,255,255,0.06)'; // Reset to default
		joy.classList.remove('movement-zone', 'active'); // Clear all classes
		
		// Reset mouse position to center when joystick is released
		const rect = canvas.getBoundingClientRect();
		const centerX = rect.left + rect.width / 2;
		const centerY = rect.top + rect.height / 2;
		dispatchMouse('mousemove', centerX, centerY);
		
		updateKeys();
	}
	joy.addEventListener('touchstart', onStart, { passive: false });
	joy.addEventListener('touchmove', onMove,  { passive: false });
	joy.addEventListener('touchend', onEnd,    { passive: false });
	joy.addEventListener('touchcancel', onEnd, { passive: false });

	// Fire and skills
	function bindButton(el, down, up){
		el.addEventListener('touchstart', (e)=>{ e.preventDefault(); down(); }, { passive:false });
		el.addEventListener('touchend',   (e)=>{ e.preventDefault(); up(); },   { passive:false });
		el.addEventListener('touchcancel',(e)=>{ e.preventDefault(); up(); },   { passive:false });
	}
	bindButton(fireBtn, ()=> dispatchMouse('mousedown'), ()=> dispatchMouse('mouseup'));
	bindButton(skill1, ()=> dispatchKey('keydown','q'), ()=> dispatchKey('keyup','q'));
	bindButton(skill2, ()=> dispatchKey('keydown','e'), ()=> dispatchKey('keyup','e'));
	bindButton(skill3, ()=> dispatchKey('keydown','r'), ()=> dispatchKey('keyup','r'));

	// Cleanup on page hide
	document.addEventListener('visibilitychange', ()=>{ if (document.hidden){ vec.x=0; vec.y=0; updateKeys(); } });
})();
