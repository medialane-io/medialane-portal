"use client";

import { ChevronDown } from "lucide-react";
import { cn } from "@/lib/utils";
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "@/components/ui/collapsible";

interface CollapsibleSectionProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  icon: React.ReactNode;
  label: React.ReactNode;
  hint?: React.ReactNode;
  contentSpacing?: string;
  children: React.ReactNode;
}

export function CollapsibleSection({
  open,
  onOpenChange,
  icon,
  label,
  hint,
  contentSpacing = "space-y-4",
  children,
}: CollapsibleSectionProps) {
  return (
    <Collapsible open={open} onOpenChange={onOpenChange}>
      <div className="sm:overflow-hidden sm:rounded-xl sm:border sm:border-border">
        <CollapsibleTrigger asChild>
          <button
            type="button"
            className="w-full flex items-center justify-between px-0 py-3 sm:px-5 sm:py-4 hover:bg-muted/30 transition-colors"
          >
            <div className="flex items-center gap-2">
              {icon}
              <span className="text-sm font-semibold">{label}</span>
              {hint && <span className="text-xs text-muted-foreground font-normal">{hint}</span>}
            </div>
            <ChevronDown
              className={cn(
                "h-4 w-4 text-muted-foreground transition-transform",
                open && "rotate-180"
              )}
            />
          </button>
        </CollapsibleTrigger>
        <CollapsibleContent>
          <div className={cn("px-0 pb-4 sm:px-5 sm:pb-5 border-t border-border/60 pt-4", contentSpacing)}>
            {children}
          </div>
        </CollapsibleContent>
      </div>
    </Collapsible>
  );
}
