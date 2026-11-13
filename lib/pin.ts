import "server-only";
import { createHmac, randomBytes, scryptSync, timingSafeEqual } from "node:crypto";

// Zahlencode eines geheimen Knopfes: 4 bis 8 Ziffern.
export function isValidPin(pin: string): boolean {
  return /^\d{4,8}$/.test(pin);
}

// Gespeichert wird nur ein Prüfwert, nie der Code selbst.
export function hashPin(pin: string): string {
  const salt = randomBytes(16);
  const hash = scryptSync(pin, salt, 32);
  return `scrypt$${salt.toString("hex")}$${hash.toString("hex")}`;
}

export function verifyPin(pin: string, stored: string | null): boolean {
  if (!stored) return false;
  const [scheme, saltHex, hashHex] = stored.split("$");
  if (scheme !== "scrypt" || !saltHex || !hashHex) return false;
  const expected = Buffer.from(hashHex, "hex");
  const actual = scryptSync(pin, Buffer.from(saltHex, "hex"), expected.length);
  return timingSafeEqual(actual, expected);
}

export const MAX_PIN_ATTEMPTS = 5;
export const PIN_LOCK_MINUTES = 10;
const UNLOCK_SECONDS = 60 * 60;

export function unlockCookieName(shortId: string): string {
  return `tapu_offen_${shortId}`;
}

function sign(shortId: string, pinHash: string, expires: number): string | null {
  const secret = process.env.SUPABASE_SECRET_KEY ?? "";
  if (secret === "") return null;
  // Der Prüfwert des Codes fließt ein: Ändert der Besitzer den Code, gilt die Freigabe nicht mehr.
  return createHmac("sha256", `tapu-unlock:${secret}`).update(`${shortId}|${pinHash}|${expires}`).digest("hex");
}

// Freigabe für diesen Browser, eine Stunde gültig.
export function createUnlockToken(shortId: string, pinHash: string): { value: string; maxAge: number } | null {
  const expires = Math.floor(Date.now() / 1000) + UNLOCK_SECONDS;
  const signature = sign(shortId, pinHash, expires);
  return signature ? { value: `${expires}.${signature}`, maxAge: UNLOCK_SECONDS } : null;
}

export function isUnlocked(shortId: string, pinHash: string, token: string | undefined): boolean {
  if (!token) return false;
  const [rawExpires, signature] = token.split(".");
  const expires = Number(rawExpires);
  if (!Number.isInteger(expires) || !signature || expires < Date.now() / 1000) return false;
  const expected = sign(shortId, pinHash, expires);
  if (!expected || expected.length !== signature.length) return false;
  return timingSafeEqual(Buffer.from(expected), Buffer.from(signature));
}
