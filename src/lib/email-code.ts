export const RESEND_COOLDOWN_SECONDS = 60;

export type EmailCodeStatus = "idle" | "sending" | "ready" | "verifying";

export interface EmailCodeState {
  status: EmailCodeStatus;
  code: string;
  error: string | null;
  cooldown: number;
}

export type EmailCodeAction =
  | { type: "code-changed"; code: string }
  | { type: "send-started" }
  | { type: "send-succeeded" }
  | { type: "send-failed"; message: string }
  | { type: "verify-started" }
  | { type: "verify-failed"; message: string }
  | { type: "tick" };

export const initialEmailCodeState: EmailCodeState = { status: "idle", code: "", error: null, cooldown: 0 };

export function emailCodeReducer(state: EmailCodeState, action: EmailCodeAction): EmailCodeState {
  switch (action.type) {
    case "code-changed":
      return { ...state, code: action.code.replace(/\D/g, "").slice(0, 6) };
    case "send-started":
      return { ...state, status: "sending", error: null };
    case "send-succeeded":
      return { ...state, status: "ready", error: null, cooldown: RESEND_COOLDOWN_SECONDS };
    case "send-failed":
      return { ...state, status: "idle", error: action.message };
    case "verify-started":
      return { ...state, status: "verifying", error: null };
    case "verify-failed":
      return { ...state, status: "ready", code: "", error: action.message };
    case "tick":
      return state.cooldown > 0 ? { ...state, cooldown: state.cooldown - 1 } : state;
  }
}

export const canVerifyCode = (state: EmailCodeState): boolean =>
  state.status === "ready" && state.code.length === 6;

export const canResendCode = (state: EmailCodeState): boolean =>
  state.cooldown === 0 && state.status !== "sending" && state.status !== "verifying";
