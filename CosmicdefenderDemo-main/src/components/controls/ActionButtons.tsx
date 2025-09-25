"use client";

export function ActionButtons(props: { onFire: (down: boolean) => void; onSkill: (id: string, down: boolean) => void }) {
	return (
		<div style={{ position: "fixed", right: 16, bottom: 16, display: "flex", flexDirection: "column", gap: 12 }}>
			<div style={{ width: 72, height: 72, borderRadius: 9999, background: "rgba(255,255,255,0.08)" }} />
			<div style={{ width: 56, height: 56, borderRadius: 9999, background: "rgba(255,255,255,0.08)" }} />
			<div style={{ width: 56, height: 56, borderRadius: 9999, background: "rgba(255,255,255,0.08)" }} />
		</div>
	);
}

