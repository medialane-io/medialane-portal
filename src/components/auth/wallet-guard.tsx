"use client";

import { authClient } from "@/src/lib/auth-client";
import { useGetWallet } from "@chipi-stack/nextjs";
import { useRouter, usePathname } from "next/navigation";
import { useEffect } from "react";

export function WalletGuard() {
    const { data: session, isPending } = authClient.useSession();
    const router = useRouter();
    const pathname = usePathname();

    const { data: wallet, isLoading, error } = useGetWallet({
        getBearerToken: () => authClient.token().then((t) => t?.token ?? ""),
        params: { externalUserId: session?.user.id ?? "" },
        queryOptions: {
            enabled: !!session?.user.id && !isPending,
            retry: false,
        },
    });

    useEffect(() => {
        if (isPending || !session?.user) return;

        // Skip check if already on onboarding page to avoid loops
        if (pathname?.startsWith("/onboarding")) return;

        if (!isLoading) {
            if (error || !wallet) {
                const user = session.user as typeof session.user & {
                    walletPublicKey?: string | null;
                };
                // If session says wallet exists, don't redirect — SDK may be temporarily unavailable
                if (user.walletPublicKey) {
                    console.error("WalletGuard: Wallet missing in SDK but exists in session. Preventing redirect loop.");
                    return;
                }
                console.log("WalletGuard: No wallet found, redirecting to onboarding.");
                router.push("/onboarding");
            }
        }
    }, [isPending, session, wallet, isLoading, error, pathname, router]);

    return null;
}
