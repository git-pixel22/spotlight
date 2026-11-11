import { NextResponse, type NextRequest } from "next/server";
import { getSession } from "@/lib/session";
import { exchangeCode } from "@/lib/buffer/oauth";
import { saveTokens } from "@/lib/buffer/tokens";
import { fetchAccount, fetchChannels } from "@/lib/buffer/api";
import { isSupported } from "@/lib/channels";
import { db, schema } from "@/lib/db";

function fail(reason: string) {
  return NextResponse.redirect(`${process.env.APP_URL}/?error=${encodeURIComponent(reason)}`);
}

export async function GET(request: NextRequest) {
  const params = request.nextUrl.searchParams;
  const session = await getSession();

  if (params.get("error")) return fail(params.get("error_description") ?? "Buffer login was cancelled");

  const code = params.get("code");
  const state = params.get("state");
  const verifier = session.oauthVerifier;
  // Reject forged or replayed callbacks.
  if (!code || !state || !verifier || state !== session.oauthState) {
    return fail("Login session expired, please try again");
  }

  try {
    const tokens = await exchangeCode(code, verifier);
    const account = await fetchAccount(tokens.access_token);
    const org = account.organizations[0];
    if (!org) return fail("No Buffer organization found on this account");

    const channels = (await fetchChannels({ token: tokens.access_token }, org.id))
      .filter((c) => !c.isDisconnected)
      .map(({ id, service, name, displayName, avatar, timezone }) => ({ id, service, name, displayName, avatar, timezone }));
    const supportedIds = channels.filter((c) => isSupported(c.service)).map((c) => c.id);

    const [user] = await db
      .insert(schema.users)
      .values({
        bufferAccountId: account.id,
        name: account.name,
        email: account.email,
        organizationId: org.id,
        timezone: account.timezone,
        channels,
        selectedChannelIds: supportedIds,
      })
      .onConflictDoUpdate({
        target: schema.users.bufferAccountId,
        set: { name: account.name, email: account.email, organizationId: org.id, timezone: account.timezone, channels, updatedAt: new Date() },
      })
      .returning();

    await saveTokens(user.id, tokens);

    session.userId = user.id;
    session.oauthState = undefined;
    session.oauthVerifier = undefined;
    await session.save();

    return NextResponse.redirect(`${process.env.APP_URL}${user.profile ? "/app" : "/app/welcome"}`);
  } catch (err) {
    console.error("OAuth callback failed", err);
    return fail("Couldn't finish connecting to Buffer, please try again");
  }
}
