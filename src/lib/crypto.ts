import "server-only";
import { createCipheriv, createDecipheriv, randomBytes } from "node:crypto";

// Buffer tokens act on someone else's account, so they're encrypted at rest
// (AES-256-GCM) and only ever decrypted on the server.
const key = Buffer.from(process.env.TOKEN_ENC_KEY ?? "", "base64");

export function encrypt(plain: string): string {
  if (key.length !== 32) throw new Error("TOKEN_ENC_KEY must be 32 bytes, base64");
  const iv = randomBytes(12);
  const cipher = createCipheriv("aes-256-gcm", key, iv);
  const data = Buffer.concat([cipher.update(plain, "utf8"), cipher.final()]);
  return [iv, cipher.getAuthTag(), data].map((b) => b.toString("base64url")).join(".");
}

export function decrypt(sealed: string): string {
  const [iv, tag, data] = sealed.split(".").map((p) => Buffer.from(p, "base64url"));
  const decipher = createDecipheriv("aes-256-gcm", key, iv);
  decipher.setAuthTag(tag);
  return Buffer.concat([decipher.update(data), decipher.final()]).toString("utf8");
}
