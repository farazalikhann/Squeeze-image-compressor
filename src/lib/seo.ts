export const SITE_NAME = 'Squeeze'
export const SITE_URL = 'https://farazalikhann.github.io/Squeeze-image-compressor'
export const DEFAULT_OG_IMAGE = `${SITE_URL}/og-image.png`

export function buildWebApplicationSchema(name: string, description: string, path: string) {
  return {
    '@context': 'https://schema.org',
    '@type': 'WebApplication',
    name: `${name} — ${SITE_NAME}`,
    description,
    url: `${SITE_URL}${path}`,
    applicationCategory: 'MultimediaApplication',
    operatingSystem: 'Any',
    isAccessibleForFree: true,
    offers: {
      '@type': 'Offer',
      price: '0',
      priceCurrency: 'USD',
    },
  }
}
