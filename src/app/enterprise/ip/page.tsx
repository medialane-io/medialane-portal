import Link from "next/link"
import { Badge } from "@/src/components/ui/badge"
import { Button } from "@/src/components/ui/button"
import { Card, CardContent } from "@/src/components/ui/card"
import { FeatureRowList, type FeatureRowItem } from "@/src/components/marketing/feature-row-list"
import {
  ShieldCheck, Globe, Zap, Megaphone, Film, Briefcase,
  Signature, Layers, Database, Users, Headset, Mail, ArrowLeft,
} from "lucide-react"

const FEATURES: FeatureRowItem[] = [
  {
    icon: ShieldCheck,
    eyebrow: "Worldwide compliance",
    color: "bg-brand-blue",
    title: "Legal Recognition & Global Backing",
    description: "Every record receives tamper-proof blockchain verification and legally recognized timestamping, giving your intellectual property solid backing in courtrooms and arbitration.",
  },
  {
    icon: Globe,
    eyebrow: "Worldwide compliance",
    color: "bg-brand-orange",
    title: "Global Validity in 170+ Countries",
    description: "Your creative assets and media rights are protected across Latin America, North America, Europe, and Asia under international intellectual property frameworks.",
  },
  {
    icon: Zap,
    eyebrow: "Worldwide compliance",
    color: "bg-brand-rose",
    title: "Fast, Digital Workflow",
    description: "Complete asset registration in under 5 minutes through a streamlined, 100% digital interface, with no legal fluff or weeks of back-and-forth.",
  },
]

const USE_CASES = [
  {
    icon: Megaphone,
    title: "Creative Agencies & Studios",
    description: "Protect campaign concepts, pitch decks, client mockups, and final deliverables before sharing them externally.",
    color: "text-brand-blue",
    bg: "bg-brand-blue/10",
  },
  {
    icon: Film,
    title: "Production Houses & Software Developers",
    description: "Timestamp original soundtracks, video edits, script revisions, and proprietary source code with absolute proof of creation date.",
    color: "text-brand-orange",
    bg: "bg-brand-orange/10",
  },
  {
    icon: Briefcase,
    title: "Corporate Media Teams & Freelancers",
    description: "Organize client projects, track asset ownership transfers, and archive digital evidence like email threads or contract approvals.",
    color: "text-brand-rose",
    bg: "bg-brand-rose/10",
  },
]

const FILE_TYPES = [
  { title: "Visual Assets", examples: "Brand guidelines, logos, photography, illustrations, blueprints." },
  { title: "Document Formats", examples: "Pitch decks, PDFs, whitepapers, contracts, briefs." },
  { title: "Digital Evidence", examples: "Email correspondence, chat exports, signed sign-offs." },
  { title: "Video & Motion", examples: "Commercial cuts, animations, short clips, raw footage." },
  { title: "Audio Content", examples: "Master tracks, voiceover recordings, podcasts, sound designs." },
  { title: "Code & Data", examples: "Source code repositories, datasets, spreadsheets, financial logs." },
]

const STEPS = [
  {
    title: "Start a New Record",
    description: "Onchain with our SDK or with our Apps medialane.io or starknet.medialane.io.",
  },
  {
    title: "Set Ownership & Visibility",
    description: "Select access permissions, tag co-creators or team members, and upload your files.",
  },
  {
    title: "Confirm & Issue Onchain Asset",
    description: "Review your details and finalize. Your file's cryptographic hash is etched onto the blockchain, generating an immutable Certificate of Ownership.",
  },
]

const GUARANTEES = [
  { icon: Signature, label: "Cryptographic authorship certificate" },
  { icon: Layers, label: "Immutable timestamping" },
  { icon: Database, label: "Decentralized, encrypted storage" },
]

export default function IpProtectionPage() {
  return (
    <div className="relative w-full overflow-hidden">
      <div className="relative z-10">

        <section className="container mx-auto px-4 pt-28 pb-16 max-w-3xl text-center space-y-5">
          <Badge className="bg-primary/10 text-primary border-primary/30 px-4 py-1.5 text-sm">
            Tokenization for IP
          </Badge>
          <h1 className="text-4xl md:text-6xl font-extrabold tracking-tight text-foreground">
            Protecting Your Creative Work Worldwide
          </h1>
          <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
            Ensure the authenticity, timestamping, and immutability of your media assets with
            blockchain technology. Protect your creative content, client deliverables, contracts,
            and digital evidence quickly, securely, and with international legal validity.
          </p>
        </section>

        <section className="container mx-auto px-4 pb-16 max-w-2xl">
          <FeatureRowList items={FEATURES} />
        </section>

        <section className="container mx-auto px-4 pb-16 max-w-5xl">
          <h2 className="text-2xl font-bold text-foreground text-center mb-6">Use Cases Built for Your Industry</h2>
          <div className="grid md:grid-cols-3 gap-6">
            {USE_CASES.map(({ icon: Icon, title, description, color, bg }) => (
              <Card key={title} className="border-border bg-foreground/5 backdrop-blur-sm">
                <CardContent className="p-6 space-y-3">
                  <div className={`h-10 w-10 rounded-lg ${bg} flex items-center justify-center`}>
                    <Icon className={`w-5 h-5 ${color}`} />
                  </div>
                  <h3 className="text-lg font-bold text-foreground">{title}</h3>
                  <p className="text-sm text-muted-foreground">{description}</p>
                </CardContent>
              </Card>
            ))}
          </div>
        </section>

        <section className="container mx-auto px-4 pb-16 max-w-4xl">
          <h2 className="text-2xl font-bold text-foreground text-center mb-2">What Can You Protect on Medialane.io?</h2>
          <p className="text-sm text-muted-foreground text-center mb-6">
            You can secure any file format on the blockchain. Key examples include:
          </p>
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {FILE_TYPES.map(({ title, examples }) => (
              <div key={title}>
                <h3 className="font-bold text-foreground text-sm">{title}</h3>
                <p className="text-sm text-muted-foreground mt-1">{examples}</p>
              </div>
            ))}
          </div>
        </section>

        <section className="container mx-auto px-4 pb-16 max-w-2xl">
          <h2 className="text-2xl font-bold text-foreground text-center mb-6">How It Works in 3 Simple Steps</h2>
          <div className="relative">
            {STEPS.map(({ title, description }, i) => (
              <div key={title} className="relative flex gap-5 pb-10 last:pb-0">
                {i < STEPS.length - 1 && (
                  <div className="absolute left-5 top-10 bottom-0 w-px bg-border" />
                )}
                <div className="relative z-10 h-10 w-10 shrink-0 rounded-full bg-brand-maeve/10 flex items-center justify-center">
                  <span className="text-sm font-bold text-brand-maeve">{i + 1}</span>
                </div>
                <div className="pt-1.5">
                  <h3 className="text-lg font-bold text-foreground">{title}</h3>
                  <p className="text-sm text-muted-foreground mt-1">{description}</p>
                </div>
              </div>
            ))}
          </div>
          <p className="text-sm text-muted-foreground text-center mt-4 italic">
            Perfect for freelancers or creators needing immediate, one-off proof of ownership for a
            high-value asset.
          </p>
        </section>

        <section className="container mx-auto px-4 pb-16 max-w-2xl">
          <div className="flex flex-wrap justify-center gap-x-8 gap-y-3">
            {GUARANTEES.map(({ icon: Icon, label }) => (
              <div key={label} className="flex items-center gap-2 text-sm font-medium text-foreground">
                <Icon className="w-4 h-4 text-brand-blue" />
                {label}
              </div>
            ))}
          </div>
        </section>

        <section className="container mx-auto px-4 pb-16 max-w-3xl">
          <h2 className="text-2xl font-bold text-foreground text-center mb-6">Client Area</h2>
          <div className="grid sm:grid-cols-2 gap-6 mb-8">
            <div className="flex items-start gap-4">
              <div className="h-10 w-10 shrink-0 rounded-lg bg-brand-blue/10 flex items-center justify-center">
                <Users className="w-5 h-5 text-brand-blue" />
              </div>
              <div>
                <h3 className="font-bold text-foreground">Client project workspaces and manager</h3>
              </div>
            </div>
            <div className="flex items-start gap-4">
              <div className="h-10 w-10 shrink-0 rounded-lg bg-brand-orange/10 flex items-center justify-center">
                <Headset className="w-5 h-5 text-brand-orange" />
              </div>
              <div>
                <h3 className="font-bold text-foreground">Priority technical support</h3>
              </div>
            </div>
          </div>
          <div className="text-center space-y-2">
            <h3 className="text-lg font-bold text-foreground">Support Built Around Your Workflow</h3>
            <p className="text-sm text-muted-foreground max-w-2xl mx-auto">
              Whether you need help onboarding your team or configuring custom access roles for
              clients, our dedicated support team is available via live chat and email to assist
              you every step of the way.
            </p>
          </div>
        </section>

        <section className="container mx-auto px-4 pb-24 max-w-2xl text-center space-y-4">
          <Button asChild variant="ghost" size="sm">
            <Link href="/enterprise"><ArrowLeft className="w-4 h-4 mr-1.5" />All Enterprise services</Link>
          </Button>
          <div>
            <Button asChild size="lg">
              <a href="mailto:dao@medialane.org"><Mail className="w-4 h-4 mr-2" />dao@medialane.org</a>
            </Button>
          </div>
        </section>
      </div>
    </div>
  )
}
