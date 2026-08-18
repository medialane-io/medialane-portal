import type { NavCommandGroup } from "@medialane/ui";
import {
  Blocks,
  Bot,
  Building2,
  Code2,
  FileText,
  Home,
  LayoutGrid,
  Rocket,
  Scale,
  ShieldCheck,
  Wallet,
} from "lucide-react";

export const NAV_COMMANDS: NavCommandGroup[] = [
  {
    items: [
      { id: "home", label: "Medialane", icon: Home, href: "/", keywords: ["home", "frontpage", "start"], description: "Start here" },
      { id: "platform", label: "Platform", icon: LayoutGrid, href: "/platform", keywords: ["how it works", "overview", "architecture"], description: "How Medialane works" },
      { id: "services", label: "Services", icon: Rocket, href: "/services", keywords: ["launchpad", "issue", "create"], description: "Everything you can issue" },
      { id: "account", label: "Account", icon: Wallet, href: "/account", keywords: ["api keys", "credits", "usage", "dashboard"], description: "Your API keys, credits & usage" },
    ],
  },
  {
    heading: "Build",
    items: [
      { id: "developers", label: "Developers", icon: Code2, href: "/developers", keywords: ["api", "build", "quickstart", "integrate"] },
      { id: "pricing", label: "Pricing", icon: Scale, href: "/pricing", keywords: ["cost", "credits", "billing"] },
      { id: "infrastructure", label: "Infrastructure", icon: Blocks, href: "/infrastructure", keywords: ["embed", "white-label", "run in your product"] },
      { id: "agents", label: "Agents", icon: Bot, href: "/agents", keywords: ["ai", "x402", "machine-payable", "automation"] },
    ],
  },
  {
    heading: "Enterprise",
    items: [
      { id: "enterprise", label: "Enterprise", icon: Building2, href: "/enterprise", keywords: ["business", "scale", "tokenize"] },
      { id: "enterprise-ip", label: "IP Protection", icon: ShieldCheck, href: "/enterprise/ip", keywords: ["copyright", "protect", "worldwide"] },
      { id: "enterprise-ai-data", label: "AI Data & Training", icon: Bot, href: "/enterprise/ai-data", keywords: ["compliance", "training data", "license"] },
      { id: "enterprise-editions", label: "Limited Editions & Drops", icon: LayoutGrid, href: "/enterprise/editions", keywords: ["editions", "drops", "numbered"] },
      { id: "enterprise-clubs", label: "Membership Clubs", icon: Building2, href: "/enterprise/clubs", keywords: ["membership", "community", "clubs"] },
      { id: "enterprise-tickets", label: "Tickets", icon: FileText, href: "/enterprise/tickets", keywords: ["events", "attendance", "tickets"] },
      { id: "enterprise-sponsorship", label: "Sponsorship", icon: Building2, href: "/enterprise/sponsorship", keywords: ["sponsor", "deal", "offer"] },
      { id: "enterprise-tokenize", label: "Tokenize & License", icon: Scale, href: "/enterprise/tokenize", keywords: ["tokenize", "license", "royalty"] },
    ],
  },
  {
    heading: "Documentation",
    items: [
      { id: "docs", label: "Docs", icon: FileText, action: () => window.open("https://docs.medialane.io", "_blank"), keywords: ["docs", "help", "guide"] },
      { id: "docs-api", label: "API Reference", icon: Code2, action: () => window.open("https://docs.medialane.io/dev/api", "_blank"), keywords: ["docs", "api", "reference"] },
      { id: "docs-sdk", label: "SDK", icon: Code2, action: () => window.open("https://docs.medialane.io/dev/sdk", "_blank"), keywords: ["docs", "sdk", "developer"] },
      { id: "docs-terms", label: "Terms of Service", icon: FileText, action: () => window.open("https://docs.medialane.io/terms", "_blank"), keywords: ["legal", "terms", "tos"] },
      { id: "docs-privacy", label: "Privacy Policy", icon: ShieldCheck, action: () => window.open("https://docs.medialane.io/privacy", "_blank"), keywords: ["privacy", "data"] },
    ],
  },
];
