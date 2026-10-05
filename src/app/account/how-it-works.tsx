import Link from "next/link";

const STEPS = [
  {
    title: "Create a key",
    body: "A key lets your app or plugin use Medialane on your behalf.",
  },
  {
    title: "Add credits",
    body: "Credits pay for what your key does. One credit is one cent, and credits don't expire.",
  },
  {
    title: "Use the key",
    body: "Paste it into your app, or into the WordPress plugin under Settings → Tokenize & Protect. Every request it makes is paid from your credits.",
  },
] as const;

export function HowItWorks() {
  return (
    <section aria-labelledby="how-it-works" className="space-y-4 rounded-2xl border border-border/60 bg-card p-6">
      <h2 id="how-it-works" className="text-base font-bold">
        How keys and credits work
      </h2>
      <ol className="space-y-3">
        {STEPS.map((step, index) => (
          <li key={step.title} className="flex items-start gap-3">
            <span className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-primary/10 text-xs font-semibold text-primary">
              {index + 1}
            </span>
            <p className="text-sm text-muted-foreground">
              <span className="font-medium text-foreground">{step.title}.</span> {step.body}
            </p>
          </li>
        ))}
      </ol>
      <p className="text-sm text-muted-foreground">
        When credits run out, requests stop until you add more.{" "}
        <Link href="/pricing" className="font-medium text-foreground underline underline-offset-4">
          See what each action costs
        </Link>
        .
      </p>
    </section>
  );
}
