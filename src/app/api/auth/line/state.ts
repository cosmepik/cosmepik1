import { createHmac, randomUUID } from "crypto";

export function createSignedState(secret: string): string {
  const ts = Date.now().toString();
  const nonce = randomUUID();
  const data = `${ts}:${nonce}`;
  const sig = createHmac("sha256", secret).update(data).digest("hex").slice(0, 16);
  return `${data}:${sig}`;
}

export function verifySignedState(state: string, secret: string): boolean {
  const parts = state.split(":");
  if (parts.length !== 3) return false;
  const [ts, nonce, sig] = parts;
  const expected = createHmac("sha256", secret).update(`${ts}:${nonce}`).digest("hex").slice(0, 16);
  if (sig !== expected) return false;
  const age = Date.now() - parseInt(ts, 10);
  return age >= 0 && age < 600_000;
}
