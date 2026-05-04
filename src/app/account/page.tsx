import { getSession } from "@/src/lib/session";
import { redirect } from "next/navigation";
import { AccountDashboard } from "./dashboard";

export default async function AccountPage() {
  const session = await getSession();

  if (!session) {
    redirect("/sign-in");
  }

  return <AccountDashboard address={session.address} mdln_tier={session.mdln_tier} />;
}
