"use client"

export type LicensingOffer = {
  id: string
  assetId: string
  assetName: string
  image?: string
  buyer: string
  licenseType: "standard" | "extended"
  duration: "perpetual" | "1y" | "5y"
  territory: "worldwide" | "na" | "eu" | "custom"
  customTerritory?: string
  attribution: boolean
  derivatives: boolean
  notes?: string
  amount: number
  expiresInDays: number
  status: "pending-approval" | "accepted" | "rejected" | "expired"
  createdAt: string
}

const STORAGE_KEY = "medialane_offers_v1"

let memOffers: LicensingOffer[] = []

function isBrowser() {
  return typeof window !== "undefined" && typeof localStorage !== "undefined"
}

export function getOffers(): LicensingOffer[] {
  if (!isBrowser()) return memOffers
  try {
    const raw = localStorage.getItem(STORAGE_KEY)
    return raw ? (JSON.parse(raw) as LicensingOffer[]) : []
  } catch {
    return []
  }
}

function setOffers(next: LicensingOffer[]) {
  if (!isBrowser()) {
    memOffers = next
    return
  }
  localStorage.setItem(STORAGE_KEY, JSON.stringify(next))

  window.dispatchEvent(new CustomEvent("offers:update"))
}

export function createOffer(input: Omit<LicensingOffer, "id" | "status" | "createdAt">): LicensingOffer {
  const offer: LicensingOffer = {
    ...input,
    id: `${Date.now()}-${Math.random().toString(36).slice(2, 8)}`,
    status: "pending-approval",
    createdAt: new Date().toISOString(),
  }
  const all = getOffers()
  all.unshift(offer)
  setOffers(all)
  return offer
}

export function onOffersUpdate(cb: () => void): () => void {
  if (!isBrowser()) return () => {}
  const handler = () => cb()
  window.addEventListener("offers:update", handler)
  window.addEventListener("storage", (e) => {
    if (e.key === STORAGE_KEY) handler()
  })
  return () => {
    window.removeEventListener("offers:update", handler)
  }
}
