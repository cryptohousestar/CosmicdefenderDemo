"use client";

import { VirtualJoystick } from "./VirtualJoystick";
import { ActionButtons } from "./ActionButtons";

export function TouchHUD(props: {
	onMove: (vec: { x: number; y: number }) => void;
	onFire: (down: boolean) => void;
	onSkill: (id: string, down: boolean) => void;
}) {
	return (
		<>
			<VirtualJoystick onChange={props.onMove} />
			<ActionButtons onFire={props.onFire} onSkill={props.onSkill} />
		</>
	);
}

