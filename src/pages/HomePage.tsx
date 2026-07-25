import Hero from '../components/Hero'
import FeatureGrid from '../components/FeatureGrid'
import ToolCard from '../components/ToolCard'
import { TOOLS } from '../lib/tools'

export default function HomePage() {
  return (
    <>
      <Hero />

      <section className="mx-auto max-w-6xl px-4 pb-14 sm:pb-20">
        <h2 className="text-center text-2xl font-bold text-slate-900 dark:text-white sm:text-3xl">
          Choose a tool
        </h2>
        <p className="mt-2.5 text-center text-slate-500 dark:text-slate-400">
          Pick what you need. More tools are on the way.
        </p>

        <div className="mt-8 grid grid-cols-1 gap-3.5 sm:grid-cols-2 lg:grid-cols-3">
          {TOOLS.map((tool) => (
            <ToolCard key={tool.id} tool={tool} />
          ))}
        </div>
      </section>

      <FeatureGrid />
    </>
  )
}
