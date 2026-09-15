import { NextResponse } from "next/server";

// Public registration is disabled — accounts are provisioned at deploy time only.
export async function POST() {
  return NextResponse.json({ error: "Registration disabled" }, { status: 403 });
}
