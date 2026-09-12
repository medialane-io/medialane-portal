import type { NavCommandGroup } from "@medialane/ui";
import {
  Home, Zap, Briefcase, Ticket, Users, Coins, Layers,
  KeyRound, Wallet, Receipt, Settings, Smartphone, ShieldCheck,
  BookOpen, FileText, ScrollText, Tag,
} from "lucide-react";

export const NAV_COMMANDS: NavCommandGroup[] = [
  {
    items: [
      { id: "home",      label: "Medialane", icon: Home,      href: "/",         keywords: ["home", "start", "frontpage", "main"], description: "Start here" },
      { id: "launchpad", label: "Launchpad", icon: Zap,       href: "/launchpad", keywords: ["issue", "mint", "create", "launch", "distribute"], description: "Issue to a list of people" },
      { id: "account",   label: "Account",   icon: Briefcase, href: "/account",   keywords: ["credits", "keys", "spend", "balance", "usage"], description: "Credits, keys & spend" },
      { id: "pricing",   label: "Pricing",   icon: Tag,       href: "/pricing",   keywords: ["cost", "price", "credits", "rates"], description: "What things cost" },
    ],
  },
  {
    heading: "Issue",
    items: [
      { id: "tickets",  label: "Tickets",     icon: Ticket, href: "/launchpad/tickets",     keywords: ["event", "pass", "entry", "admission"] },
      { id: "club",     label: "Memberships", icon: Users,  href: "/launchpad/club",        keywords: ["member", "club", "subscription", "tier"] },
      { id: "editions", label: "Editions",    icon: Layers, href: "/launchpad/nfteditions", keywords: ["nft", "edition", "collectible", "multiple"] },
      { id: "coins",    label: "Creator Coin", icon: Coins, href: "/launchpad/coin/create", keywords: ["token", "coin", "erc20"] },
    ],
  },
  {
    heading: "Account",
    items: [
      { id: "credits",  label: "Credits",   icon: Wallet,     href: "/account", keywords: ["balance", "top up", "buy", "usdc"] },
      { id: "keys",     label: "API keys",  icon: KeyRound,   href: "/account", keywords: ["key", "token", "developer", "agent"] },
      { id: "spend",    label: "Spend",     icon: Receipt,    href: "/account", keywords: ["usage", "history", "billing"] },
      { id: "settings", label: "Settings",  icon: Settings,   href: "/settings", keywords: ["wallet", "devices", "recovery", "export"] },
      { id: "devices",  label: "Devices",   icon: Smartphone, href: "/settings", keywords: ["pair", "link", "phone", "laptop"] },
      { id: "recover",  label: "Recovery",  icon: ShieldCheck, href: "/recover",  keywords: ["guardian", "lost", "restore", "escape"] },
    ],
  },
  {
    heading: "Learn",
    items: [
      { id: "docs",    label: "Docs",    icon: BookOpen,   href: "https://docs.medialane.io", keywords: ["documentation", "guide", "api", "reference"] },
      { id: "terms",   label: "Terms",   icon: FileText,   href: "/terms",   keywords: ["legal", "conditions"] },
      { id: "privacy", label: "Privacy", icon: ScrollText, href: "/privacy", keywords: ["legal", "data"] },
    ],
  },
];
