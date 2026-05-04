import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/src/components/ui/card";
import { WalletConnect } from "@/src/components/wallet-connect";

export default function SignInPage() {
  return (
    <div className="min-h-screen flex items-center justify-center px-4 pt-20">
      <Card className="w-full max-w-md border-white/10 bg-black/40 backdrop-blur-md">
        <CardHeader className="text-center">
          <CardTitle className="text-2xl font-bold text-white">Connect Wallet</CardTitle>
          <CardDescription className="text-muted-foreground">
            Your Starknet wallet is your account. No email or password needed.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <WalletConnect />
        </CardContent>
      </Card>
    </div>
  );
}
