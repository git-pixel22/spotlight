import { existsSync } from "node:fs";
import { dirname, extname, resolve as resolvePath } from "node:path";
import { fileURLToPath, pathToFileURL } from "node:url";

const SRC = resolvePath(dirname(fileURLToPath(import.meta.url)), "../../src");
const EXTS = [".ts", ".tsx", "/index.ts"];
const find = (base) => EXTS.map((ext) => base + ext).find(existsSync);

export async function resolve(specifier, context, next) {
  if (specifier === "server-only") return { url: "data:text/javascript,", shortCircuit: true };
  // "@/lib/x" -> src/lib/x.ts
  if (specifier.startsWith("@/")) {
    const file = find(resolvePath(SRC, specifier.slice(2)));
    if (file) return { url: pathToFileURL(file).href, shortCircuit: true };
  }
  // Extensionless relative imports inside the app ("./oauth") -> ./oauth.ts
  if (specifier.startsWith(".") && !extname(specifier) && context.parentURL?.startsWith("file:")) {
    const file = find(resolvePath(dirname(fileURLToPath(context.parentURL)), specifier));
    if (file) return { url: pathToFileURL(file).href, shortCircuit: true };
  }
  return next(specifier, context);
}
