import { NextResponse } from "next/server";

export async function POST(request: Request) {
	const body = await request.json().catch(() => ({}));
	// TODO: bridge to backend/game.js applyInput
	return NextResponse.json({ ok: true, received: body }, { status: 200 });
}

