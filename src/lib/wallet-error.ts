export interface FriendlyWalletError {
  title: string;
  message: string;
  description?: string;
  isUserRejection: boolean;
}

export class WrongNetworkError extends Error {
  constructor() {
    super("Your wallet is connected to the wrong network.");
    this.name = "WrongNetworkError";
  }
}

export function isWrongNetwork(
  chainId: bigint | string | undefined,
  expectedChainId: string,
): boolean {
  return chainId != null && BigInt(chainId).toString() !== expectedChainId;
}

export function assertCorrectNetwork(
  chainId: bigint | string | undefined,
  expectedChainId: string,
): void {
  if (isWrongNetwork(chainId, expectedChainId)) {
    throw new WrongNetworkError();
  }
}

function collectErrorText(error: unknown): string {
  if (!error) return "";
  if (typeof error === "string") return error;
  if (error instanceof Error) return error.message;

  if (typeof error === "object") {
    const source = error as Record<string, unknown>;
    const parts: string[] = [];

    for (const key of ["message", "name", "code", "shortMessage"]) {
      const value = source[key];
      if (value !== undefined) parts.push(String(value));
    }

    const messages = source.errorMessages;
    if (messages && typeof messages === "object") {
      parts.push(...Object.values(messages).map(String));
    }

    return parts.join(" ");
  }

  return String(error);
}

export function isBareExecuteFailure(error: unknown): boolean {
  return collectErrorText(error).trim().toLowerCase() === "execute failed";
}

export function isUserRejectedRequest(error: unknown): boolean {
  const text = collectErrorText(error).toLowerCase();
  return (
    text.includes("user_refused_op") ||
    text.includes("user refused") ||
    text.includes("user rejected") ||
    text.includes("user abort") ||
    text.includes("user denied") ||
    text.includes("request rejected") ||
    text.includes("rejected by user") ||
    text.includes("cancelled") ||
    text.includes("canceled") ||
    isBareExecuteFailure(error)
  );
}

function isTransientNetworkError(text: string): boolean {
  return /-32001|unable to complete request|service unavailable|temporarily unavailable|rate.?limit|too many requests|gateway time-?out|bad gateway|failed to fetch|fetch failed|network ?error|load failed|\b50[234]\b|\b429\b/i.test(
    text,
  );
}

function looksTechnical(text: string): boolean {
  return (
    /rpc:|jsonrpc|starknet_call|entry_point_selector|contract_address|fetchendpoint|errorhandler|at async|baseerror|"code"\s*:\s*-?\d|https?:\/\//i.test(
      text,
    ) || text.length > 160
  );
}

export function getFriendlyWalletError(error: unknown): FriendlyWalletError {

  if (isBareExecuteFailure(error)) {
    return {
      title: "Request not completed",
      message: "Request not completed. Nothing was submitted.",
      description: "Your wallet didn't complete this request. This usually means you closed or declined it, your wallet needs extra verification (like 2FA) before it can sign, or your wallet hit a temporary network hiccup. Nothing was submitted. Try again in a moment.",
      isUserRejection: true,
    };
  }

  if (isUserRejectedRequest(error)) {

    return {
      title: "Request not completed",
      message: "Request not completed. Nothing was submitted.",
      description: "Your wallet didn't complete this request. You may have closed or declined it, or your wallet may require extra verification (like 2FA) before it can sign. Check your wallet for details, then try again.",
      isUserRejection: true,
    };
  }

  if (error instanceof WrongNetworkError) {
    return {
      title: "Wrong network",
      message: "Your wallet is connected to the wrong network. Nothing was submitted.",
      description: "Switch your wallet to Starknet Mainnet, then try again.",
      isUserRejection: false,
    };
  }

  const raw = collectErrorText(error);

  if (isTransientNetworkError(raw)) {
    return {
      title: "Network busy",
      message:
        "The network is busy right now. Nothing was submitted, and your asset is safe. Please try again in a moment.",
      isUserRejection: false,
    };
  }

  const lower = raw.toLowerCase();
  const stack = error instanceof Error && typeof error.stack === "string" ? error.stack.toLowerCase() : "";
  if (lower.includes("validation failure") && (lower.includes("jscontrollererror") || stack.includes("jscontrollererror"))) {
    return {
      title: "Not enough gas",
      message: "Your wallet doesn't have enough STRK (or ETH) to pay for this transaction's gas fee.",
      description: "Add funds to your wallet, then try again.",
      isUserRejection: false,
    };
  }

  if (lower.includes("insufficient") && (lower.includes("balance") || lower.includes("allowance") || lower.includes("funds"))) {
    return {
      title: "Insufficient balance",
      message: "You don't have enough balance to complete this transaction.",
      isUserRejection: false,
    };
  }

  if (/unknown_error/i.test(raw) || (typeof error === "object" && error !== null && (error as { code?: unknown }).code === 163)) {
    return {
      title: "Something went wrong",
      message:
        "Your wallet couldn't complete this transaction. Nothing was submitted. Try again, or try a different wallet or device if it keeps happening.",
      isUserRejection: false,
    };
  }

  if (!raw || looksTechnical(raw)) {
    return {
      title: "Something went wrong",
      message:
        "We couldn't complete that action. Please try again in a moment. If it keeps happening, try a different wallet or refresh the page.",
      isUserRejection: false,
    };
  }

  return {
    title: "Something went wrong",
    message: raw,
    isUserRejection: false,
  };
}
