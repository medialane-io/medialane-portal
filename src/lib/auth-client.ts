import { createAuthClient } from "better-auth/react";
import { jwtClient } from "better-auth/client/plugins";

export const authClient = createAuthClient({
  baseURL: process.env.NEXT_PUBLIC_APP_URL ?? "https://portal.medialane.io",
  plugins: [jwtClient()],
});

export type Session = typeof authClient.$Infer.Session;
