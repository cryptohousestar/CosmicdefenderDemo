export function isTouchPreferred(): boolean {
	if (typeof window === "undefined") return false;
	const coarse = typeof window.matchMedia === "function" && window.matchMedia("(pointer: coarse)").matches;
	const maxTouch = typeof navigator !== "undefined" && (navigator as any).maxTouchPoints > 0;
	return !!(coarse || maxTouch);
}

export function getDevicePixelRatio(): number {
	if (typeof window === "undefined") return 1;
	return Math.max(1, Math.min(window.devicePixelRatio || 1, 3));
}

