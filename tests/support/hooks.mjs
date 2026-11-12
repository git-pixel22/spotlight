import { existsSync } from "node:fs";
import { dirname, resolve as resolvePath } from "node:path";
import { fileURLToPath, pathToFileURL } from "node:url";

const SRC = resolvePath(dirname(fileURLToPath(import.meta.url)), "../../src");

export async function resolve(specifier, context, next) {
  if (specifier === "server-only") return { url: "data:text/javascript,", shortCircuit: true };
  if (specifier.startsWith("@/")) {
    const base = resolvePath(SRC, specifier.slice(2));
    const file = [".ts", ".tsx", "/index.ts"].map((ext) => base + ext).find(existsSync);
    if (file) return { url: pathToFileURL(file).href, shortCircuit: true };
  }
  return next(specifier, context);
}
