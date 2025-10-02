"use client";

export function VirtualJoystick(props: { onChange: (v: { x: number; y: number }) => void }) {
	// Placeholder: just reserves space; real logic vendrá luego
	return (
		<div
			className="hud-zone"
			style={{ position: "fixed", left: 16, bottom: 16, width: 160, height: 160, background: "rgba(255,255,255,0.06)", borderRadius: 9999 }}
		/>
	);
}

