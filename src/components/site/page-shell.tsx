import Link from "next/link";
import type { ReactNode } from "react";

export function PageHero({ eyebrow, title, description, children }: { eyebrow?: string; title: string; description?: string; children?: ReactNode }) {
  return (
    <section className="w-full max-w-screen-2xl mx-auto px-4 sm:px-6 pt-16 sm:pt-24 text-center space-y-5">
      {eyebrow ? <p className="text-xs font-semibold uppercase tracking-wide text-primary">{eyebrow}</p> : null}
      <h1 className="font-display text-4xl md:text-6xl font-extrabold tracking-tight text-foreground">{title}</h1>
      {description ? <p className="text-lg text-muted-foreground max-w-2xl mx-auto">{description}</p> : null}
      {children}
    </section>
  );
}

export function PageBody({ children }: { children: ReactNode }) {
  return <div className="w-full max-w-screen-2xl mx-auto px-4 sm:px-6 space-y-10 sm:space-y-16 mt-16">{children}</div>;
}

export function Section({ id, title, description, children }: { id?: string; title: string; description?: string; children?: ReactNode }) {
  return (
    <section id={id} className="space-y-6 scroll-mt-24">
      <div className="text-center space-y-2">
        <h2 className="font-display text-2xl font-bold text-foreground">{title}</h2>
        {description ? <p className="text-sm text-muted-foreground max-w-2xl mx-auto">{description}</p> : null}
      </div>
      {children}
    </section>
  );
}

export function CardGrid({ columns = 3, children }: { columns?: 2 | 3 | 4; children: ReactNode }) {
  const layout = { 2: "sm:grid-cols-2 max-w-3xl mx-auto", 3: "sm:grid-cols-2 lg:grid-cols-3", 4: "sm:grid-cols-2 lg:grid-cols-4" }[columns];
  return <div className={`grid gap-4 ${layout}`}>{children}</div>;
}

export function InfoCard({ eyebrow, title, description, href }: { eyebrow?: string; title: string; description: string; href?: string }) {
  const body = (
    <>
      {eyebrow ? <p className="text-xs font-semibold uppercase tracking-wide text-primary">{eyebrow}</p> : null}
      <h3 className="font-display text-lg font-bold text-foreground">{title}</h3>
      <p className="text-sm text-muted-foreground">{description}</p>
    </>
  );
  const base = "rounded-2xl border border-border/60 bg-card p-6 space-y-2";
  if (!href) return <div className={base}>{body}</div>;
  const external = /^https?:\/\//.test(href);
  const className = `${base} block hover:border-primary/60 transition-colors`;
  return external ? (
    <a href={href} target="_blank" rel="noopener noreferrer" className={className}>
      {body}
    </a>
  ) : (
    <Link href={href} className={className}>
      {body}
    </Link>
  );
}

export function StepList({ steps }: { steps: { title: string; description: string }[] }) {
  return (
    <ol className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
      {steps.map((step, index) => (
        <li key={step.title} className="rounded-2xl border border-border/60 bg-card p-6 space-y-2">
          <p className="text-xs font-semibold uppercase tracking-wide text-primary">Step {index + 1}</p>
          <h3 className="font-display text-lg font-bold text-foreground">{step.title}</h3>
          <p className="text-sm text-muted-foreground">{step.description}</p>
        </li>
      ))}
    </ol>
  );
}
