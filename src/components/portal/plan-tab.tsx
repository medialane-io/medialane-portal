"use client";

import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/src/components/ui/card";
import { Badge } from "@/src/components/ui/badge";
import { Button } from "@/src/components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from "@/src/components/ui/dialog";
import { Zap, Shield, Rocket, ExternalLink } from "lucide-react";

interface PlanTabProps {
  plan: "FREE" | "PREMIUM" | string;
}

const PLAN_LIMITS = {
  FREE: { rateLimit: "50 req/month", monthlyReqs: "Resets 1st of each month", features: ["REST API access", "NFT metadata indexing", "Collection queries", "Activity feeds"] },
  PREMIUM: { rateLimit: "Unlimited · 3,000 req/min", monthlyReqs: "No monthly cap", features: ["Everything in FREE", "Webhooks", "Priority support", "Advanced analytics", "Batch operations"] },
};

export function PlanTab({ plan }: PlanTabProps) {
  const [open, setOpen] = useState(false);
  const isPremium = plan === "PREMIUM";
  const limits = isPremium ? PLAN_LIMITS.PREMIUM : PLAN_LIMITS.FREE;

  return (
    <div className="space-y-4">
      <Card className="border-primary/20 bg-background/50 backdrop-blur-sm">
        <CardHeader>
          <div className="flex items-center justify-between flex-wrap gap-3">
            <div>
              <CardTitle className="text-lg flex items-center gap-2">
                {isPremium ? (
                  <Rocket className="w-5 h-5 text-yellow-500" />
                ) : (
                  <Shield className="w-5 h-5 text-primary" />
                )}
                Current Plan
              </CardTitle>
              <CardDescription>Your API access tier and limits</CardDescription>
            </div>
            <Badge
              className={
                isPremium
                  ? "bg-yellow-500/15 text-yellow-600 border-yellow-500/30 text-base px-4 py-1"
                  : "bg-muted text-muted-foreground border text-base px-4 py-1"
              }
            >
              {isPremium ? "PREMIUM" : "FREE"}
            </Badge>
          </div>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="grid sm:grid-cols-2 gap-4">
            <div className="rounded-xl border border-border bg-muted/20 p-4 space-y-1">
              <p className="text-xs text-muted-foreground uppercase tracking-wider">Request Limit</p>
              <p className="text-xl font-bold text-foreground">{limits.rateLimit}</p>
            </div>
            <div className="rounded-xl border border-border bg-muted/20 p-4 space-y-1">
              <p className="text-xs text-muted-foreground uppercase tracking-wider">Reset Policy</p>
              <p className="text-xl font-bold text-foreground">{limits.monthlyReqs}</p>
            </div>
          </div>

          <div className="space-y-2">
            <p className="text-sm font-medium text-foreground">Included features</p>
            <ul className="space-y-1.5">
              {limits.features.map((f) => (
                <li key={f} className="flex items-center gap-2 text-sm text-muted-foreground">
                  <Zap className="w-3.5 h-3.5 text-primary shrink-0" />
                  {f}
                </li>
              ))}
            </ul>
          </div>

          {!isPremium && (
            <Button
              className="w-full sm:w-auto"
              onClick={() => setOpen(true)}
            >
              <Rocket className="w-4 h-4 mr-2" />
              Request Premium Access
            </Button>
          )}

          {isPremium && (
            <div className="rounded-xl border border-yellow-500/20 bg-yellow-500/5 p-4 text-sm text-muted-foreground">
              You have Premium access. View webhook documentation or contact{" "}
              <a
                href="mailto:api@medialane.io"
                className="text-primary underline underline-offset-2"
              >
                api@medialane.io
              </a>{" "}
              for enterprise pricing.
            </div>
          )}
        </CardContent>
      </Card>

      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Rocket className="w-5 h-5 text-yellow-500" />
              Request Premium Access
            </DialogTitle>
            <DialogDescription>
              Premium unlocks 3,000 req/min, webhooks, priority support, and unlimited monthly
              requests. Send us an email and we'll get you set up.
            </DialogDescription>
          </DialogHeader>
          <div className="rounded-xl border border-border bg-muted/20 p-4 space-y-2 text-sm">
            <p className="text-muted-foreground">Include in your email:</p>
            <ul className="space-y-1 text-foreground list-disc list-inside">
              <li>Your use case / project description</li>
              <li>Expected request volume</li>
              <li>Your account email</li>
            </ul>
          </div>
          <DialogFooter className="sm:justify-start gap-2">
            <Button asChild>
              <a href="mailto:api@medialane.io?subject=Premium%20Access%20Request" target="_blank" rel="noopener noreferrer">
                <ExternalLink className="w-4 h-4 mr-2" />
                Email api@medialane.io
              </a>
            </Button>
            <Button variant="ghost" onClick={() => setOpen(false)}>
              Cancel
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
