import { NextResponse } from "next/server";

export async function GET() {
	// TODO: bridge to backend/game.js getFrameState
	return NextResponse.json({ ok: true, state: {} }, { status: 200 });
}

