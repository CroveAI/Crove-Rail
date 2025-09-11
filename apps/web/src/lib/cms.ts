export type Homepage = {
  heroTitle: string | null
  heroSubtitle: string | null
  primaryCtaLabel: string | null
  primaryCtaHref: string | null
  secondaryCtaLabel: string | null
  secondaryCtaHref: string | null
  ctaHeading: string | null
  ctaDescription: string | null
  ctaPrimaryLabel: string | null
  ctaPrimaryHref: string | null
  ctaSecondaryLabel: string | null
  ctaSecondaryHref: string | null
}

export type FaqItem = { question: string; answer: string }

export type Pricing = { title: string | null; lead: string | null }
export type PricingTier = {
  id?: number
  name: string
  slug: string
  description?: string | null
  priceMonthly?: number | string | null
  highlights?: string[] | null
}
export type Company = { title: string | null; lead: string | null }

const STRAPI_URL = process.env.NEXT_PUBLIC_STRAPI_URL || 'http://localhost:1347'

async function fetchJson<T>(path: string, init?: RequestInit): Promise<T | null> {
  try {
    const res = await fetch(`${STRAPI_URL}${path}`, {
      // Revalidate at most every 60s on the server
      next: { revalidate: 60 },
      ...init,
    })
    if (!res.ok) {
      if (res.status === 404) {
        return null
      }
      return null
    }
    return (await res.json()) as T
  } catch (_err) {
    return null
  }
}

export async function getHomepage(): Promise<Homepage | null> {
  // Strapi v5 single-type returns flat data under data (no attributes)
  const json = await fetchJson<{ data: (Homepage & Record<string, unknown>) | null }>(`/api/homepage`)
  if (!json || !json.data) return null
  const src = json.data as Homepage
  return {
    heroTitle: src.heroTitle ?? null,
    heroSubtitle: src.heroSubtitle ?? null,
    primaryCtaLabel: src.primaryCtaLabel ?? null,
    primaryCtaHref: src.primaryCtaHref ?? null,
    secondaryCtaLabel: src.secondaryCtaLabel ?? null,
    secondaryCtaHref: src.secondaryCtaHref ?? null,
    ctaHeading: src.ctaHeading ?? null,
    ctaDescription: src.ctaDescription ?? null,
    ctaPrimaryLabel: src.ctaPrimaryLabel ?? null,
    ctaPrimaryHref: src.ctaPrimaryHref ?? null,
    ctaSecondaryLabel: src.ctaSecondaryLabel ?? null,
    ctaSecondaryHref: src.ctaSecondaryHref ?? null,
  }
}

export async function getFaqs(): Promise<FaqItem[]> {
  const json = await fetchJson<{ data: Array<FaqItem> }>(`/api/faqs`)
  if (!json || !Array.isArray(json.data)) return []
  return json.data
    .map((item) => {
      const hasQuestion = typeof (item as any).question !== 'undefined'
      const hasAnswer = typeof (item as any).answer !== 'undefined'
      if (!hasQuestion || !hasAnswer) return null
      return { question: String((item as any).question), answer: String((item as any).answer) }
    })
    .filter((v): v is FaqItem => !!v)
}

export async function getPricing(): Promise<Pricing | null> {
  const json = await fetchJson<{ data: (Pricing & Record<string, unknown>) | null }>(`/api/pricing`)
  if (!json || !json.data) return null
  const src = json.data as Pricing
  return { title: src.title ?? null, lead: src.lead ?? null }
}

export async function getPricingTiers(): Promise<PricingTier[]> {
  const json = await fetchJson<{ data: Array<PricingTier & Record<string, unknown>> }>(`/api/pricing-tiers`)
  if (!json || !Array.isArray(json.data)) return []
  return json.data.map((item) => ({
    id: (item as any).id,
    name: String((item as any).name ?? ''),
    slug: String((item as any).slug ?? ''),
    description: (item as any).description ?? null,
    priceMonthly: (item as any).priceMonthly ?? null,
    highlights: Array.isArray((item as any).highlights) ? (item as any).highlights : null,
  }))
}

export async function getCompany(): Promise<Company | null> {
  const json = await fetchJson<{ data: (Company & Record<string, unknown>) | null }>(`/api/company`)
  if (!json || !json.data) return null
  const src = json.data as Company
  return { title: src.title ?? null, lead: src.lead ?? null }
}


