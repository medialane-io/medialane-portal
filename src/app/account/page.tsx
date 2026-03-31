import { auth } from "@/src/lib/auth";
import { headers } from "next/headers";
import { redirect } from "next/navigation";
import { AccountDashboard } from "./dashboard";

export default async function AccountPage() {
  const session = await auth.api.getSession({ headers: await headers() });

  if (!session) {
    redirect("/sign-in");
  }

  const user = session.user as typeof session.user & {
    plan?: string;
    walletPublicKey?: string | null;
  };

  return (
    <AccountDashboard
      initialPlan={user.plan ?? "FREE"}
      userImageUrl=""
      userFullName={user.name ?? null}
      userEmail={user.email}
      userId={user.id}
      publicKey={user.walletPublicKey ?? undefined}
    />
  );
}
