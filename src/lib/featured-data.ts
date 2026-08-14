export interface FeaturedItem {
    id: string
    title: string
    description: string
    image: string
    link: string
    ctaText: string
    tag: string
}

export const FEATURED_DATA: FeaturedItem[] = [
    {
        id: "workshop",
        title: "Da Web 2 para Web 3 em 1 hora",
        description: "Alcance o mercado global com seu app onchain",
        image: "/workshop.jpg",
        link: "/workshop",
        ctaText: "Workshop",
        tag: "Starknet"
    },
    {
        id: "newyorker",
        title: "New Yorker",
        description: "New York City Photography Collection",
        image: "/moma.jpg",
        link: "/collections/0x2c215c0925d5e85224a9d74ef4c09ed4d5c168f8a251d330aca410b62569252",
        ctaText: "Explore",
        tag: "Photography"
    },

]
