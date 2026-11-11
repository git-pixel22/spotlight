import "server-only";
import { NextResponse } from "next/server";
import { ZodError } from "zod";
import { UnauthorizedError } from "@/lib/session";
import { ReauthRequiredError } from "@/lib/buffer/tokens";
import { BufferApiError } from "@/lib/buffer/client";
import { AllModelsFailedError } from "@/lib/ai/router";

export function jsonError(status: number, error: string, extra?: Record<string, unknown>) {
  return NextResponse.json({ error, ...extra }, { status });
}

/** Maps known failures to friendly JSON errors for route handlers. */
export async function handle(fn: () => Promise<Response>): Promise<Response> {
  try {
    return await fn();
  } catch (err) {
    if (err instanceof ZodError) {
      const issue = err.issues[0];
      return jsonError(400, issue ? `${issue.path.join(".") || "input"}: ${issue.message}` : "Invalid request");
    }
    if (err instanceof UnauthorizedError) return jsonError(401, "Please connect Buffer first.");
    if (err instanceof ReauthRequiredError) return jsonError(401, "Your Buffer connection expired. Please reconnect.", { reauth: true });
    if (err instanceof AllModelsFailedError) {
      console.error(err.message);
      return jsonError(503, "Our free AI quota is busy right now. Try again in a minute, or try the sample week.", { busy: true });
    }
    if (err instanceof BufferApiError) return jsonError(err.status === 429 ? 429 : 502, `Buffer said: ${err.message}`);
    console.error(err);
    return jsonError(500, (err as Error).message || "Something went wrong");
  }
}
