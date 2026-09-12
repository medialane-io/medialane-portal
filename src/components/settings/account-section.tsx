"use client";

import type React from "react";
import { cn } from "@/lib/utils";

export function AccountSection({
  icon: Icon, iconColor = "text-primary", iconBg = "bg-primary/10", title, description, children,
}: {
  icon: React.ElementType; iconColor?: string; iconBg?: string; title: string; description: string; children: React.ReactNode;
}) {
  return (
    <div className="rounded-2xl border border-border/60 bg-card p-5 sm:p-6 space-y-5">
      <div className="flex items-start gap-3">
        <div className={cn("h-10 w-10 shrink-0 rounded-full flex items-center justify-center", iconBg)}>
          <Icon className={cn("h-5 w-5", iconColor)} />
        </div>
        <div>
          <h3 className="text-base font-bold text-foreground">{title}</h3>
          <p className="text-sm text-muted-foreground mt-0.5">{description}</p>
        </div>
      </div>
      <div className="space-y-4">{children}</div>
    </div>
  );
}
