import { betterAuth } from "better-auth";
import { jwt } from "better-auth/plugins";
import { pool } from "./db";

export const auth = betterAuth({
  secret: process.env.BETTER_AUTH_SECRET!,
  baseURL: process.env.BETTER_AUTH_URL ?? "https://portal.medialane.io",
  database: pool,
  emailAndPassword: {
    enabled: true,
  },
  plugins: [
    jwt({
      jwks: {
        keyPairConfig: { alg: "RS256" },
      },
      jwt: {
        expirationTime: "15m",
      },
    }),
  ],
  user: {
    additionalFields: {
      plan: {
        type: "string",
        defaultValue: "FREE",
        nullable: false,
        input: false,
      },
      walletPublicKey: {
        type: "string",
        nullable: true,
        input: false,
      },
      walletEncryptedPrivateKey: {
        type: "string",
        nullable: true,
        input: false,
      },
      backendApiKey: {
        type: "string",
        nullable: true,
        input: false,
        returned: false,
      },
      backendTenantId: {
        type: "string",
        nullable: true,
        input: false,
        returned: false,
      },
    },
  },
});

export type Auth = typeof auth;
