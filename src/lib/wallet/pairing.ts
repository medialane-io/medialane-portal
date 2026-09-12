const SCHEME = "medialane-device";
const VERSION = 1;
const LABEL_MAX = 32;
const STARK_PRIME = (1n << 251n) + 17n * (1n << 192n) + 1n;

export class InvalidPairingPayloadError extends Error {
  constructor(message = "This code is not a Medialane device request.") {
    super(message);
    this.name = "InvalidPairingPayloadError";
  }
}

export interface PairingPayload {
  publicKey: string;
  label: string;
}

function normalisePublicKey(input: unknown): string {
  if (typeof input !== "string" || !/^0x[0-9a-fA-F]+$/.test(input)) {
    throw new InvalidPairingPayloadError("That device key is not valid.");
  }
  const value = BigInt(input);
  if (value === 0n || value >= STARK_PRIME) {
    throw new InvalidPairingPayloadError("That device key is not valid.");
  }
  return `0x${value.toString(16)}`;
}

function sanitiseLabel(input: unknown): string {
  const raw = typeof input === "string" ? input : "";
  return raw.replace(/\s+/g, " ").trim().slice(0, LABEL_MAX);
}

export function encodePairingPayload(payload: PairingPayload): string {
  return JSON.stringify({
    scheme: SCHEME,
    version: VERSION,
    publicKey: normalisePublicKey(payload.publicKey),
    label: sanitiseLabel(payload.label),
  });
}

export function parsePairingPayload(encoded: string): PairingPayload {
  let data: Record<string, unknown>;
  try {
    data = JSON.parse(encoded) as Record<string, unknown>;
  } catch {
    throw new InvalidPairingPayloadError();
  }
  if (data === null || typeof data !== "object") throw new InvalidPairingPayloadError();
  if (data.scheme !== SCHEME || data.version !== VERSION) throw new InvalidPairingPayloadError();
  return {
    publicKey: normalisePublicKey(data.publicKey),
    label: sanitiseLabel(data.label),
  };
}

export function parseAccountAddress(input: string): string {
  const trimmed = typeof input === "string" ? input.trim() : "";
  if (!/^0x[0-9a-fA-F]{50,64}$/.test(trimmed)) {
    throw new InvalidPairingPayloadError("That does not look like an account address.");
  }
  if (BigInt(trimmed) === 0n) {
    throw new InvalidPairingPayloadError("That does not look like an account address.");
  }
  return trimmed;
}
