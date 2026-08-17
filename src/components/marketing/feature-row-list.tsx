import type { LucideIcon } from "lucide-react"
import { cn } from "@/src/lib/utils"

export interface FeatureRowItem {
  icon: LucideIcon
  eyebrow?: string
  title: string
  description: string
  color: string // solid Tailwind bg class, e.g. "bg-brand-blue"
}

export function FeatureRowList({ items }: { items: FeatureRowItem[] }) {
  return (
    <div className="divide-y divide-border/40">
      {items.map(({ icon: Icon, eyebrow, title, description, color }) => (
        <div key={title} className="flex items-start gap-5 py-6 first:pt-0 last:pb-0">
          <div className={cn("h-12 w-12 shrink-0 rounded-lg flex items-center justify-center", color)}>
            <Icon className="w-6 h-6 text-white" />
          </div>
          <div>
            {eyebrow && (
              <p className="text-xs font-bold uppercase tracking-wide text-foreground/70 mb-1">
                {eyebrow}
              </p>
            )}
            <h3 className="text-xl font-black text-foreground">{title}</h3>
            <p className="text-base text-muted-foreground mt-1 leading-relaxed">{description}</p>
          </div>
        </div>
      ))}
    </div>
  )
}
