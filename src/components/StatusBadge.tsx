import type { QueueStatus } from '../types'

export default function StatusBadge({ status }: { status: QueueStatus }) {
  if (status === 'processing') {
    return (
      <div className="absolute inset-0 flex items-center justify-center bg-black/40">
        <svg className="h-6 w-6 animate-spin text-white" viewBox="0 0 24 24" fill="none">
          <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
          <path className="opacity-90" fill="currentColor" d="M4 12a8 8 0 018-8v4a4 4 0 00-4 4H4z" />
        </svg>
      </div>
    )
  }
  if (status === 'done') {
    return (
      <div className="absolute right-1 top-1 flex h-5 w-5 animate-success-pop items-center justify-center rounded-full bg-emerald-500 text-white shadow">
        <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" className="h-3 w-3">
          <path
            d="M5 13l4 4L19 7"
            stroke="currentColor"
            strokeWidth="3"
            strokeLinecap="round"
            strokeLinejoin="round"
            className="animate-check-draw"
          />
        </svg>
      </div>
    )
  }
  if (status === 'error') {
    return (
      <div className="absolute right-1 top-1 flex h-5 w-5 items-center justify-center rounded-full bg-red-500 text-white shadow">
        !
      </div>
    )
  }
  return null
}
