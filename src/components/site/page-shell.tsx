import Image from "next/image";
import Link from "next/link";
import type { ReactNode } from "react";

const HERO_GLOW =
  "bg-[radial-gradient(60%_80%_at_50%_0%,hsl(var(--brand-purple)/0.28),transparent_70%),radial-gradient(50%_70%_at_100%_100%,hsl(var(--brand-blue)/0.2),transparent_70%)]";

const FADE_LEFT = { WebkitMaskImage: "linear-gradient(to right, transparent 0, #000 50%)", maskImage: "linear-gradient(to right, transparent 0, #000 50%)" };
const FADE_TOP = { WebkitMaskImage: "linear-gradient(to bottom, transparent 0, #000 40%)", maskImage: "linear-gradient(to bottom, transparent 0, #000 40%)" };

export function Eyebrow({ children }: { children: ReactNode }) {
  return <p className="text-xs font-semibold uppercase tracking-[0.14em] text-primary">{children}</p>;
}

export function PageHero({
  eyebrow,
  title,
  description,
  image,
  children,
}: {
  eyebrow?: string;
  title: string;
  description?: string;
  image?: string;
  children?: ReactNode;
}) {
  const split = Boolean(image);
  return (
    <section className="relative isolate overflow-hidden">
      <div aria-hidden className={`absolute inset-0 -z-10 ${HERO_GLOW}`} />
      {image ? (
        <>
          <Image
            src={image}
            alt=""
            width={1680}
            height={1120}
            priority
            style={FADE_LEFT}
            className="absolute inset-y-0 right-0 -z-10 hidden h-full w-[62%] object-cover object-[55%_center] lg:block"
          />
          <Image src={image} alt="" width={1680} height={1120} priority style={FADE_TOP} className="absolute inset-x-0 bottom-0 -z-10 h-64 w-full object-cover lg:hidden" />
        </>
      ) : null}
      <div
        className={`mx-auto w-full max-w-screen-xl px-4 sm:px-6 pt-28 sm:pt-40 ${split ? "pb-72 lg:pb-28 text-left" : "pb-20 sm:pb-28 text-center"}`}
      >
        <div className={split ? "max-w-xl space-y-6" : "mx-auto max-w-3xl space-y-6"}>
          {eyebrow ? <Eyebrow>{eyebrow}</Eyebrow> : null}
          <h1 className="font-display text-4xl sm:text-5xl md:text-6xl font-bold leading-[1.05] tracking-tight text-foreground">{title}</h1>
          {description ? <p className={`text-lg sm:text-xl text-muted-foreground ${split ? "" : "mx-auto max-w-2xl"}`}>{description}</p> : null}
          {children ? <div className={split ? "pt-2" : "pt-4"}>{children}</div> : null}
        </div>
      </div>
    </section>
  );
}

export function PageBody({ children }: { children: ReactNode }) {
  return <div className="mx-auto w-full max-w-screen-xl space-y-24 px-4 pt-8 sm:space-y-32 sm:px-6">{children}</div>;
}

export function Section({ id, title, description, children }: { id?: string; title: string; description?: string; children?: ReactNode }) {
  return (
    <section id={id} className="scroll-mt-24 space-y-12">
      <div className="mx-auto max-w-2xl space-y-4 text-center">
        <h2 className="font-display text-3xl font-bold leading-tight text-foreground sm:text-4xl">{title}</h2>
        {description ? <p className="text-base text-muted-foreground sm:text-lg">{description}</p> : null}
      </div>
      {children}
    </section>
  );
}

export function CardGrid({ columns = 3, children }: { columns?: 2 | 3 | 4; children: ReactNode }) {
  const layout = { 2: "sm:grid-cols-2 max-w-4xl mx-auto", 3: "sm:grid-cols-2 lg:grid-cols-3", 4: "sm:grid-cols-2 lg:grid-cols-4" }[columns];
  return <div className={`grid gap-5 ${layout}`}>{children}</div>;
}

export function InfoCard({
  eyebrow,
  title,
  description,
  href,
  image,
}: {
  eyebrow?: string;
  title: string;
  description: string;
  href?: string;
  image?: string;
}) {
  const body = (
    <>
      {image ? (
        <div className="relative aspect-[16/10] overflow-hidden">
          <Image src={image} alt="" fill sizes="(min-width: 1024px) 33vw, (min-width: 640px) 50vw, 100vw" className="object-cover transition-transform duration-500 group-hover:scale-105" />
        </div>
      ) : null}
      <div className="space-y-2 p-7">
        {eyebrow ? <Eyebrow>{eyebrow}</Eyebrow> : null}
        <h3 className="font-display text-xl font-semibold text-foreground">{title}</h3>
        <p className="text-sm leading-relaxed text-muted-foreground sm:text-base">{description}</p>
      </div>
    </>
  );
  const base = "group block overflow-hidden rounded-3xl bg-secondary/60";
  if (!href) return <div className={base}>{body}</div>;
  const external = /^https?:\/\//.test(href);
  const className = `${base} transition-colors hover:bg-secondary`;
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
    <ol className="grid gap-10 sm:grid-cols-2 lg:grid-cols-4">
      {steps.map((step) => (
        <li key={step.title} className="space-y-2 border-l-2 border-primary/60 pl-5">
          <h3 className="font-display text-lg font-semibold text-foreground">{step.title}</h3>
          <p className="text-sm leading-relaxed text-muted-foreground sm:text-base">{step.description}</p>
        </li>
      ))}
    </ol>
  );
}

export function Panel({ children }: { children: ReactNode }) {
  return (
    <div className="relative isolate overflow-hidden rounded-3xl bg-[hsl(var(--brand-navy))] px-6 py-16 text-center sm:px-16 sm:py-24">
      <div
        aria-hidden
        className="absolute inset-0 -z-10 bg-[radial-gradient(55%_90%_at_12%_0%,hsl(var(--brand-purple)/0.24),transparent_70%),radial-gradient(55%_90%_at_90%_100%,hsl(var(--brand-blue)/0.26),transparent_70%),radial-gradient(35%_60%_at_55%_110%,hsl(var(--brand-rose)/0.14),transparent_70%)]"
      />
      <div className="mx-auto max-w-2xl space-y-5 text-[#f5f6fa]">{children}</div>
    </div>
  );
}
