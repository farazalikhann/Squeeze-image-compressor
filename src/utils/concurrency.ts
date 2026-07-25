/** Runs `worker` over `items` with at most `limit` in flight at once. */
export async function runWithConcurrency<T>(items: T[], limit: number, worker: (item: T) => Promise<void>) {
  let cursor = 0
  const runners = Array.from({ length: Math.min(limit, items.length) }, async () => {
    while (cursor < items.length) {
      const item = items[cursor]
      cursor++
      await worker(item)
    }
  })
  await Promise.all(runners)
}
