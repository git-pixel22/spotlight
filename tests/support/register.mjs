// Lets plain Node run the tests against app code: resolves the "@/" alias to src/ and
// stubs "server-only" (a Next.js build-time guard). TypeScript runs via type stripping.
import { register } from "node:module";

register("./hooks.mjs", import.meta.url);
