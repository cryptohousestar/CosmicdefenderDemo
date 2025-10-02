export type InputPayload = {
	moveX: number;
	moveY: number;
	fire: boolean;
	skills: { [skillId: string]: boolean };
	ts: number;
};

export class InputController {
	private current: InputPayload = {
		moveX: 0,
		moveY: 0,
		fire: false,
		skills: {},
		ts: typeof performance !== "undefined" ? performance.now() : Date.now(),
	};

	setMove(vec: { x: number; y: number }) {
		this.current.moveX = Math.max(-1, Math.min(1, vec.x));
		this.current.moveY = Math.max(-1, Math.min(1, vec.y));
		this.current.ts = typeof performance !== "undefined" ? performance.now() : Date.now();
	}

	setFire(down: boolean) {
		this.current.fire = !!down;
		this.current.ts = typeof performance !== "undefined" ? performance.now() : Date.now();
	}

	setSkill(id: string, down: boolean) {
		this.current.skills[id] = !!down;
		this.current.ts = typeof performance !== "undefined" ? performance.now() : Date.now();
	}

	getSnapshot(): InputPayload {
		return { ...this.current, skills: { ...this.current.skills } };
	}
}

