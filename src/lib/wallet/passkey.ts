import {
  deriveAesKey,
  deriveStarkKeyPair,
  generateStarkKeyPair,
  starkKeyPairFromPrivateKey,
  InvalidStarkPrivateKeyError,
  sealPrivateKey,
  unsealPrivateKey,
} from "@medialane/sdk/starknet";
import { computeWalletAddress } from "./account";
import { loadAccountEmail } from "./account-wallet";
import { loadSealedOwner } from "./store";

export { signWithPrivateKey } from "@medialane/sdk/starknet";
export { InvalidStarkPrivateKeyError };

const RP_NAME = "Medialane";
const CANONICAL_RP_ID = "www.medialane.io";

function relyingPartyId(): string {
  const host = location.hostname;
  return host === "medialane.io" || host.endsWith(".medialane.io") ? CANONICAL_RP_ID : host;
}

const enc = (s: string): Uint8Array<ArrayBuffer> => {
  const src = new TextEncoder().encode(s);
  const out = new Uint8Array(new ArrayBuffer(src.byteLength));
  out.set(src);
  return out;
};
const rand = (n: number): Uint8Array<ArrayBuffer> => {
  const out = new Uint8Array(new ArrayBuffer(n));
  crypto.getRandomValues(out);
  return out;
};
const unb64 = (s: string): Uint8Array<ArrayBuffer> => {
  const bin = atob(s);
  const out = new Uint8Array(new ArrayBuffer(bin.length));
  for (let i = 0; i < bin.length; i++) out[i] = bin.charCodeAt(i);
  return out;
};
const b64 = (buf: ArrayBuffer | Uint8Array): string =>
  btoa(String.fromCharCode(...new Uint8Array(buf as ArrayBuffer)));

const PRF_SALT = enc("medialane://io/owner-key/v1");
const HKDF_INFO = enc("medialane-io-owner-key");

export class PasskeyCancelledError extends Error {
  constructor() {
    super("Passkey confirmation was cancelled.");
    this.name = "PasskeyCancelledError";
  }
}

function isPasskeyCancellation(e: unknown): boolean {
  return e instanceof DOMException && (e.name === "NotAllowedError" || e.name === "AbortError");
}

export interface SealedOwner {
  credentialId: string;
  ownerPubKey: string;
  address: string;

  iv?: string;
  ciphertext?: string;
}

function assertBrowser(): void {
  if (typeof window === "undefined" || !window.crypto?.subtle || !navigator.credentials) {
    throw new Error("Passkey signer requires a browser secure context (WebAuthn + WebCrypto).");
  }
}

interface Registration {
  credentialId: string;
  prfFirst: ArrayBuffer | null;
}

async function stableUserId(email: string): Promise<Uint8Array<ArrayBuffer>> {
  const digest = await crypto.subtle.digest("SHA-256", new TextEncoder().encode(email));
  return new Uint8Array(digest);
}

async function passkeyUser(): Promise<PublicKeyCredentialUserEntity> {
  const email = loadAccountEmail();
  if (!email) return { id: rand(16), name: "Medialane", displayName: "Medialane" };
  return { id: await stableUserId(email), name: email, displayName: email };
}

function knownCredentials(): PublicKeyCredentialDescriptor[] {
  const id = loadSealedOwner()?.credentialId;
  return id ? [{ type: "public-key", id: unb64(id) }] : [];
}

async function registerPasskey(): Promise<Registration> {
  let cred: PublicKeyCredential;
  try {
    cred = (await navigator.credentials.create({
      publicKey: {
        challenge: rand(32),
        rp: { name: RP_NAME, id: relyingPartyId() },
        user: await passkeyUser(),
        excludeCredentials: knownCredentials(),
        pubKeyCredParams: [{ type: "public-key", alg: -7 }, { type: "public-key", alg: -257 }],
        authenticatorSelection: {
          residentKey: "required",
          userVerification: "required",
          authenticatorAttachment: "platform",
        },
        extensions: { prf: { eval: { first: PRF_SALT } } } as AuthenticationExtensionsClientInputs,
      },
    })) as PublicKeyCredential;
  } catch (e) {
    if (isPasskeyCancellation(e)) throw new PasskeyCancelledError();
    throw e;
  }
  const prf = (cred.getClientExtensionResults() as {
    prf?: { enabled?: boolean; results?: { first?: ArrayBuffer } };
  }).prf;
  return { credentialId: b64(cred.rawId), prfFirst: prf?.results?.first ?? null };
}

function prfUnsupportedMessage(): string {
  const isBrave = typeof navigator !== "undefined" && "brave" in navigator;
  const cause = isBrave
    ? "Brave doesn't currently support the WebAuthn PRF extension."
    : "This browser didn't return a passkey PRF secret.";
  return (
    `${cause} Medialane needs it to seal your key. Your device passkey (Touch ID) is fine, ` +
    "the limitation is the browser. Please open this in Safari or Chrome on an up-to-date OS."
  );
}

async function prfSecret(credentialId: string): Promise<Uint8Array<ArrayBuffer>> {
  let assertion: PublicKeyCredential;
  try {
    assertion = (await navigator.credentials.get({
      publicKey: {
        challenge: rand(32),
        rpId: relyingPartyId(),
        allowCredentials: [{ type: "public-key", id: unb64(credentialId) }],
        userVerification: "required",
        extensions: { prf: { eval: { first: PRF_SALT } } } as AuthenticationExtensionsClientInputs,
      },
    })) as PublicKeyCredential;
  } catch (e) {
    if (isPasskeyCancellation(e)) throw new PasskeyCancelledError();
    throw e;
  }
  const result = (assertion.getClientExtensionResults() as { prf?: { results?: { first?: ArrayBuffer } } })
    .prf?.results?.first;
  if (!result) throw new Error("Passkey PRF unavailable on this device/browser.");
  return new Uint8Array(result);
}

export async function discoverOwnerKey(): Promise<SealedOwner> {
  assertBrowser();

  let assertion: PublicKeyCredential;
  try {
    assertion = (await navigator.credentials.get({
      publicKey: {
        challenge: rand(32),
        rpId: relyingPartyId(),
        userVerification: "required",
        extensions: { prf: { eval: { first: PRF_SALT } } } as AuthenticationExtensionsClientInputs,
      },
    })) as PublicKeyCredential;
  } catch (e) {
    if (isPasskeyCancellation(e)) throw new PasskeyCancelledError();
    throw e;
  }

  const result = (assertion.getClientExtensionResults() as { prf?: { results?: { first?: ArrayBuffer } } })
    .prf?.results?.first;
  if (!result) throw new Error(prfUnsupportedMessage());

  const { publicKeyHex } = await deriveStarkKeyPair(new Uint8Array(result));
  return {
    credentialId: b64(assertion.rawId),
    ownerPubKey: publicKeyHex,
    address: computeWalletAddress(publicKeyHex, 0),
  };
}

export interface CreatedOwner {
  sealed: SealedOwner;

  privateKeyHex: string;
}

export async function createOwnerKey(): Promise<CreatedOwner> {
  assertBrowser();
  const reg = await registerPasskey();

  let secret: Uint8Array<ArrayBuffer>;
  if (reg.prfFirst) {
    secret = new Uint8Array(reg.prfFirst);
  } else {
    try {
      secret = await prfSecret(reg.credentialId);
    } catch {
      throw new Error(prfUnsupportedMessage());
    }
  }

  const { privateKeyHex, publicKeyHex } = await deriveStarkKeyPair(secret);
  return {
    sealed: {
      credentialId: reg.credentialId,
      ownerPubKey: publicKeyHex,
      address: computeWalletAddress(publicKeyHex, 0),
    },
    privateKeyHex,
  };
}

export async function unlockOwnerKey(sealed: SealedOwner): Promise<string> {
  assertBrowser();
  const secret = await prfSecret(sealed.credentialId);

  if (sealed.iv && sealed.ciphertext) {
    const aes = await deriveAesKey(secret, HKDF_INFO);
    return unsealPrivateKey(aes, unb64(sealed.iv), unb64(sealed.ciphertext));
  }

  const { privateKeyHex } = await deriveStarkKeyPair(secret);
  return privateKeyHex;
}

export function walletAddressForPrivateKey(privateKeyInput: string): string {
  const { publicKeyHex } = starkKeyPairFromPrivateKey(privateKeyInput);
  return computeWalletAddress(publicKeyHex, 0);
}

export async function sealImportedOwnerKey(privateKeyInput: string): Promise<SealedOwner> {
  assertBrowser();
  const { privateKeyHex, publicKeyHex } = starkKeyPairFromPrivateKey(privateKeyInput);

  const reg = await registerPasskey();
  let secret: Uint8Array<ArrayBuffer>;
  if (reg.prfFirst) {
    secret = new Uint8Array(reg.prfFirst);
  } else {
    try {
      secret = await prfSecret(reg.credentialId);
    } catch {
      throw new Error(prfUnsupportedMessage());
    }
  }

  const aes = await deriveAesKey(secret, HKDF_INFO);
  const iv = rand(12);
  const ciphertext = await sealPrivateKey(aes, iv, privateKeyHex);

  return {
    credentialId: reg.credentialId,
    ownerPubKey: publicKeyHex,
    address: computeWalletAddress(publicKeyHex, 0),
    iv: b64(iv),
    ciphertext: b64(ciphertext),
  };
}

