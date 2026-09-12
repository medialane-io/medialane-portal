export type SignInDestination = "onboard" | "pair" | "continue";

export function destinationAfterSignIn(input: {
  accountExisted: boolean;
  walletAdopted: boolean;
  hasLocalKey: boolean;
}): SignInDestination {
  if (!input.accountExisted) return "onboard";
  if (!input.walletAdopted) return "onboard";
  return input.hasLocalKey ? "continue" : "pair";
}
