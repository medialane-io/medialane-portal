import Link from "next/link";

export default function HomePage() {
  return (
    <div className="container mx-auto max-w-3xl px-4 py-24 space-y-6">
      <h1 className="text-4xl font-bold tracking-tight sm:text-5xl">Medialane</h1>
      <p className="text-lg text-muted-foreground">
        Buy credits, hold an API key, and issue to a list of people.
      </p>
      <div className="flex flex-wrap gap-3">
        <Link href="/connect" className="rounded-full bg-primary px-5 py-2 text-sm font-medium text-primary-foreground">
          Get started
        </Link>
        <Link href="/pricing" className="rounded-full border border-border/60 px-5 py-2 text-sm">
          See what it costs
        </Link>
      </div>
    </div>
  );
}
