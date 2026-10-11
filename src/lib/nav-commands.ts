import type { NavCommandGroup } from "@medialane/ui";
import {
  Home, Zap, Briefcase, Database, Ticket, Award,
  KeyRound, Wallet, Receipt, Settings, Smartphone, ShieldCheck,
  BookOpen, FileText, ScrollText, Tag, Mail,
  Globe, LayoutGrid, Code2, Bot, Server,
} from "lucide-react";

export const NAV_COMMANDS: NavCommandGroup[] = [
  {
    items: [
      { id: "home",      label: "Medialane", icon: Home,      href: "/",          keywords: ["home", "start", "frontpage", "main"], description: "Start here" },
      { id: "launchpad", label: "Launchpad", icon: Zap,       href: "/launchpad", keywords: ["issue", "mint", "create", "launch", "distribute"], description: "Issue to a list of people" },
      { id: "account",   label: "Account",   icon: Briefcase, href: "/account",   keywords: ["credits", "keys", "spend", "balance", "usage"], description: "Credits, keys and spend" },
      { id: "pricing",   label: "Pricing",   icon: Tag,       href: "/pricing",   keywords: ["cost", "price", "credits", "rates"], description: "What things cost" },
    ],
  },
  {
    heading: "Launchpad",
    items: [
      { id: "data-tokenization",   label: "Data Tokenization",   icon: Database, href: "/launchpad/data-tokenization",   keywords: ["catalog", "register", "license", "ip", "ai"], description: "Register a catalog" },
      { id: "ip-ticketing",        label: "IP Ticketing",        icon: Ticket,   href: "/launchpad/ip-ticketing",        keywords: ["event", "pass", "entry", "admission"], description: "Issue tickets to a guest list" },
      { id: "certificate-emission", label: "Certificate Emission", icon: Award,   href: "/launchpad/certificate-emission", keywords: ["credential", "diploma", "badge", "soulbound"], description: "Issue certificates to recipients" },
    ],
  },
  {
    heading: "Platform",
    items: [
      { id: "platform-nav",       label: "How it works",   icon: Globe,      href: "/platform",       keywords: ["architecture", "layers", "protocol"], description: "How Medialane works" },
      { id: "services-nav",       label: "Services",       icon: LayoutGrid, href: "/services",       keywords: ["tickets", "certificates", "ip", "ai", "licensing"], description: "Everything you can issue" },
      { id: "developers-nav",     label: "Developers",     icon: Code2,      href: "/developers",     keywords: ["api", "sdk", "integration", "build"], description: "One API for the protocol" },
      { id: "agents-nav",         label: "AI agents",      icon: Bot,        href: "/agents",         keywords: ["x402", "headless", "pay-per-call"], description: "Headless auth for AI agents" },
      { id: "infrastructure-nav", label: "Infrastructure", icon: Server,     href: "/infrastructure", keywords: ["white-label", "build", "platform"], description: "Tokenization for your product" },
      { id: "contact-nav",        label: "Contact",        icon: Mail,       href: "/contact",        keywords: ["talk", "sales", "enterprise", "email"], description: "Talk to us" },
    ],
  },
  {
    heading: "Account",
    items: [
      { id: "credits",  label: "Credits",   icon: Wallet,      href: "/account#add-credits", keywords: ["balance", "top up", "buy", "usdc"] },
      { id: "keys",     label: "API keys",  icon: KeyRound,    href: "/account",           keywords: ["key", "token", "developer", "agent"] },
      { id: "spend",    label: "Spend",     icon: Receipt,     href: "/account",           keywords: ["usage", "history", "billing"] },
      { id: "settings", label: "Settings",  icon: Settings,    href: "/settings",          keywords: ["email", "wallet", "account"] },
      { id: "devices",  label: "Devices",   icon: Smartphone,  href: "/settings/devices",  keywords: ["pair", "link", "phone", "laptop"] },
      { id: "recover",  label: "Recovery",  icon: ShieldCheck, href: "/settings/recovery", keywords: ["guardian", "lost", "restore", "recovery key"] },
    ],
  },
  {
    heading: "Learn",
    items: [
      { id: "docs",    label: "Docs",    icon: BookOpen,   href: "https://docs.medialane.io", keywords: ["documentation", "guide", "api", "reference"] },
      { id: "terms",   label: "Terms",   icon: FileText,   href: "https://docs.medialane.io/guidelines/terms",   keywords: ["legal", "conditions"] },
      { id: "privacy", label: "Privacy", icon: ScrollText, href: "https://docs.medialane.io/guidelines/privacy", keywords: ["legal", "data"] },
    ],
  },
];
