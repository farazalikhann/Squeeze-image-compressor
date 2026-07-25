import { Helmet } from 'react-helmet-async'
import { DEFAULT_OG_IMAGE, SITE_NAME, SITE_URL } from '../lib/seo'

interface Props {
  title: string
  description: string
  /** Route path starting with "/", or "" for the homepage. */
  path: string
  /** One or more JSON-LD structured-data objects to embed for this page. */
  jsonLd?: object | object[]
}

export default function Seo({ title, description, path, jsonLd }: Props) {
  const url = `${SITE_URL}${path}`
  const schemas = jsonLd ? (Array.isArray(jsonLd) ? jsonLd : [jsonLd]) : []

  return (
    <Helmet>
      <title>{title}</title>
      <meta name="description" content={description} />
      <link rel="canonical" href={url} />

      <meta property="og:type" content="website" />
      <meta property="og:site_name" content={SITE_NAME} />
      <meta property="og:title" content={title} />
      <meta property="og:description" content={description} />
      <meta property="og:url" content={url} />
      <meta property="og:image" content={DEFAULT_OG_IMAGE} />

      <meta name="twitter:card" content="summary_large_image" />
      <meta name="twitter:title" content={title} />
      <meta name="twitter:description" content={description} />
      <meta name="twitter:image" content={DEFAULT_OG_IMAGE} />

      {schemas.map((schema, i) => (
        <script key={i} type="application/ld+json">
          {JSON.stringify(schema)}
        </script>
      ))}
    </Helmet>
  )
}
