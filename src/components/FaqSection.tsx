export interface FaqItem {
  question: string
  answer: string
}

interface Props {
  items: FaqItem[]
}

/** Renders a small FAQ list and emits matching FAQPage JSON-LD so the same
 *  copy that's visible to users is also eligible for Google's FAQ rich results. */
export default function FaqSection({ items }: Props) {
  if (items.length === 0) return null

  const jsonLd = {
    '@context': 'https://schema.org',
    '@type': 'FAQPage',
    mainEntity: items.map((item) => ({
      '@type': 'Question',
      name: item.question,
      acceptedAnswer: {
        '@type': 'Answer',
        text: item.answer,
      },
    })),
  }

  return (
    <section className="mx-auto mt-10 w-full max-w-3xl border-t border-slate-200 pt-8 dark:border-slate-800">
      <h2 className="text-lg font-bold text-slate-900 dark:text-white">Frequently asked questions</h2>
      <div className="mt-4 space-y-3">
        {items.map((item) => (
          <div
            key={item.question}
            className="rounded-xl border border-slate-200 bg-white p-4 dark:border-slate-800 dark:bg-slate-900"
          >
            <h3 className="text-sm font-semibold text-slate-800 dark:text-slate-100">{item.question}</h3>
            <p className="mt-1.5 text-sm text-slate-600 dark:text-slate-400">{item.answer}</p>
          </div>
        ))}
      </div>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }} />
    </section>
  )
}
