import { useMemo, useState } from 'react'
import Hero from '../components/Hero'
import FeatureGrid from '../components/FeatureGrid'
import ToolCard from '../components/ToolCard'
import ToolSearchBar from '../components/ToolSearchBar'
import CategoryChips from '../components/CategoryChips'
import type { CategoryFilter } from '../components/CategoryChips'
import { CATEGORY_META, CATEGORY_ORDER, TOOLS } from '../lib/tools'

export default function HomePage() {
  const [query, setQuery] = useState('')
  const [category, setCategory] = useState<CategoryFilter>('all')

  const filteredTools = useMemo(() => {
    const q = query.trim().toLowerCase()
    return TOOLS.filter((tool) => {
      const matchesQuery = !q || tool.name.toLowerCase().includes(q) || tool.description.toLowerCase().includes(q)
      const matchesCategory = category === 'all' || tool.category === category
      return matchesQuery && matchesCategory
    })
  }, [query, category])

  const isFiltering = query.trim().length > 0 || category !== 'all'

  const sections = useMemo(
    () =>
      CATEGORY_ORDER.map((cat) => ({
        category: cat,
        tools: filteredTools.filter((t) => t.category === cat),
      })).filter((section) => section.tools.length > 0),
    [filteredTools],
  )

  return (
    <>
      <Hero />

      <section className="mx-auto max-w-6xl px-4 pb-14 sm:pb-20">
        <ToolSearchBar value={query} onChange={setQuery} />

        <div className="mt-4">
          <CategoryChips value={category} onChange={setCategory} />
        </div>

        <div className="mt-10">
          {filteredTools.length === 0 ? (
            <div className="rounded-2xl border border-dashed border-slate-300 bg-white px-6 py-14 text-center dark:border-slate-700 dark:bg-slate-900">
              <p className="text-base font-semibold text-slate-700 dark:text-slate-200">No tools match "{query}"</p>
              <p className="mt-1.5 text-sm text-slate-500 dark:text-slate-400">
                Try a different search term, or clear the filters below.
              </p>
              <button
                type="button"
                onClick={() => {
                  setQuery('')
                  setCategory('all')
                }}
                className="mt-5 inline-flex h-10 items-center justify-center rounded-lg bg-indigo-600 px-5 text-sm font-semibold text-white transition-colors hover:bg-indigo-700"
              >
                Clear filters
              </button>
            </div>
          ) : isFiltering ? (
            <div className="grid grid-cols-1 gap-3.5 sm:grid-cols-2 lg:grid-cols-3">
              {filteredTools.map((tool) => (
                <ToolCard key={tool.id} tool={tool} />
              ))}
            </div>
          ) : (
            <div className="flex flex-col gap-12">
              {sections.map((section) => (
                <div key={section.category}>
                  <div className="flex items-end justify-between gap-3">
                    <div>
                      <h2 className="text-lg font-bold text-slate-900 dark:text-white sm:text-xl">
                        {CATEGORY_META[section.category].label}
                      </h2>
                      <p className="mt-0.5 text-sm text-slate-500 dark:text-slate-400">
                        {CATEGORY_META[section.category].description}
                      </p>
                    </div>
                    <button
                      type="button"
                      onClick={() => setCategory(section.category)}
                      className="shrink-0 text-sm font-medium text-indigo-600 hover:underline dark:text-indigo-400"
                    >
                      See all →
                    </button>
                  </div>

                  <div className="mt-4 grid grid-cols-1 gap-3.5 sm:grid-cols-2 lg:grid-cols-3">
                    {section.tools.map((tool) => (
                      <ToolCard key={tool.id} tool={tool} />
                    ))}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </section>

      <FeatureGrid />
    </>
  )
}
