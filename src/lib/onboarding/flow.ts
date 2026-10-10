export type OnboardingStep =
  | "email"
  | "checking-email"
  | "code"
  | "verifying-code"
  | "creating-passkey"
  | "deploying"
  | "signing-in"
  | "pair-or-recover"
  | "setup-elsewhere"
  | "done";

export interface FlowState {
  step: OnboardingStep;
  error: string | null;
  canRetry: boolean;
  accountExisted: boolean;
  walletAddress: string | null;
}

export type FlowEvent =
  | { type: "email-submitted" }
  | { type: "account-found"; exists: boolean }
  | { type: "code-sent" }
  | { type: "email-step-failed"; message: string }
  | { type: "code-submitted" }
  | { type: "code-failed"; message: string | null }
  | { type: "wallet-setup-started" }
  | { type: "wallet-progress"; step: "creating-passkey" | "deploying" | "signing-in" }
  | { type: "wallet-failed"; message: string; canRetry: boolean }
  | { type: "link-required" }
  | { type: "needs-pairing"; walletAddress: string }
  | { type: "needs-setup-elsewhere" }
  | { type: "finished" };

export const initialFlow = (start: "email" | "wallet"): FlowState => ({
  step: start === "wallet" ? "creating-passkey" : "email",
  error: null,
  canRetry: true,
  accountExisted: false,
  walletAddress: null,
});

export function flowReducer(state: FlowState, event: FlowEvent): FlowState {
  switch (event.type) {
    case "email-submitted":
      return { ...state, step: "checking-email", error: null };
    case "account-found":
      return { ...state, accountExisted: event.exists };
    case "code-sent":
      return { ...state, step: "code", error: null };
    case "email-step-failed":
      return { ...state, step: "email", error: event.message };
    case "code-submitted":
      return { ...state, step: "verifying-code", error: null };
    case "code-failed":
      return { ...state, step: "code", error: event.message };
    case "wallet-setup-started":
      return { ...state, step: "creating-passkey", error: null, canRetry: true };
    case "wallet-progress":
      return { ...state, step: event.step };
    case "wallet-failed":
      return { ...state, step: "creating-passkey", error: event.message, canRetry: event.canRetry };
    case "link-required":
      return { ...state, step: "email" };
    case "needs-pairing":
      return { ...state, step: "pair-or-recover", error: null, walletAddress: event.walletAddress };
    case "needs-setup-elsewhere":
      return { ...state, step: "setup-elsewhere", error: null };
    case "finished":
      return { ...state, step: "done" };
  }
}
