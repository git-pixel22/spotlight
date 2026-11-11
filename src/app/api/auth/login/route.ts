import { NextResponse } from "next/server";
import { getSession } from "@/lib/session";
import { authorizeUrl, createPkce } from "@/lib/buffer/oauth";

export async function GET() {
  const { verifier, challenge, state } = createPkce();
  const session = await getSession();
  session.oauthState = state;
  session.oauthVerifier = verifier;
  await session.save();
  return NextResponse.redirect(authorizeUrl(challenge, state));
}
