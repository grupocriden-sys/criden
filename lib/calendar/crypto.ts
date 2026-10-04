import { createCipheriv, createDecipheriv, randomBytes } from "node:crypto";

// Los tokens de renovación se guardan cifrados (AES-256-GCM) con una clave que solo vive en el
// servidor (TOKEN_ENCRYPTION_KEY, 32 bytes en base64). Quien lea la base de datos no puede usarlos.
function key() {
  const raw = process.env.TOKEN_ENCRYPTION_KEY ?? "";
  const buf = Buffer.from(raw, "base64");
  if (buf.length !== 32) throw new Error("TOKEN_ENCRYPTION_KEY debe ser de 32 bytes en base64");
  return buf;
}

export const cryptoConfigured = () =>
  Buffer.from(process.env.TOKEN_ENCRYPTION_KEY ?? "", "base64").length === 32;

export function encrypt(plain: string) {
  const iv = randomBytes(12);
  const cipher = createCipheriv("aes-256-gcm", key(), iv);
  const data = Buffer.concat([cipher.update(plain, "utf8"), cipher.final()]);
  return [iv, cipher.getAuthTag(), data].map((b) => b.toString("base64url")).join(".");
}

export function decrypt(token: string) {
  const [iv, tag, data] = token.split(".").map((p) => Buffer.from(p, "base64url"));
  const decipher = createDecipheriv("aes-256-gcm", key(), iv);
  decipher.setAuthTag(tag);
  return Buffer.concat([decipher.update(data), decipher.final()]).toString("utf8");
}
