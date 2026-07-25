import { useCallback, useRef, useState } from 'react'
import type { DragEvent } from 'react'
import { MAX_FILES } from '../hooks/useImageQueue'

interface Props {
  onFiles: (files: File[]) => void
  currentCount: number
}

export default function UploadZone({ onFiles, currentCount }: Props) {
  const [isDragging, setIsDragging] = useState(false)
  const dragCounter = useRef(0)
  const inputRef = useRef<HTMLInputElement>(null)

  const handleFiles = useCallback(
    (fileList: FileList | null) => {
      if (!fileList || fileList.length === 0) return
      onFiles(Array.from(fileList))
    },
    [onFiles],
  )

  const onDragEnter = (e: DragEvent) => {
    e.preventDefault()
    dragCounter.current++
    setIsDragging(true)
  }
  const onDragLeave = (e: DragEvent) => {
    e.preventDefault()
    dragCounter.current--
    if (dragCounter.current <= 0) setIsDragging(false)
  }
  const onDragOver = (e: DragEvent) => e.preventDefault()
  const onDrop = (e: DragEvent) => {
    e.preventDefault()
    dragCounter.current = 0
    setIsDragging(false)
    handleFiles(e.dataTransfer.files)
  }

  const remaining = MAX_FILES - currentCount

  return (
    <div
      onDragEnter={onDragEnter}
      onDragLeave={onDragLeave}
      onDragOver={onDragOver}
      onDrop={onDrop}
      onClick={() => inputRef.current?.click()}
      role="button"
      tabIndex={0}
      onKeyDown={(e) => {
        if (e.key === 'Enter' || e.key === ' ') inputRef.current?.click()
      }}
      className={`group relative flex cursor-pointer flex-col items-center justify-center rounded-2xl border-2 border-dashed px-6 py-14 text-center transition-all sm:py-20 ${
        isDragging
          ? 'border-indigo-500 bg-indigo-50 dark:border-indigo-400 dark:bg-indigo-500/10'
          : 'border-slate-300 bg-white hover:border-indigo-400 hover:bg-indigo-50/50 dark:border-slate-700 dark:bg-slate-900 dark:hover:border-indigo-500 dark:hover:bg-indigo-500/5'
      }`}
    >
      <input
        ref={inputRef}
        type="file"
        multiple
        accept="image/jpeg,image/png,image/webp,image/avif,image/heic,image/heif,.jpg,.jpeg,.png,.webp,.avif,.heic,.heif"
        className="hidden"
        onChange={(e) => {
          handleFiles(e.target.files)
          e.target.value = ''
        }}
      />

      <div
        className={`mb-4 flex h-16 w-16 items-center justify-center rounded-2xl bg-indigo-100 text-indigo-600 transition-transform dark:bg-indigo-500/15 dark:text-indigo-400 ${
          isDragging ? 'scale-110' : 'group-hover:scale-105'
        }`}
      >
        <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" className="h-8 w-8">
          <path
            d="M12 16V4m0 0-4 4m4-4 4 4M4 16v2a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2v-2"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
        </svg>
      </div>

      <p className="text-lg font-semibold text-slate-800 dark:text-slate-100">
        {isDragging ? 'Drop your images here' : 'Drag & drop images, or click to browse'}
      </p>
      <p className="mt-1.5 text-sm text-slate-500 dark:text-slate-400">
        JPG, PNG, WebP, AVIF, HEIC · up to {MAX_FILES} images at once
      </p>
      {remaining < MAX_FILES && (
        <p className="mt-1 text-xs text-slate-400 dark:text-slate-500">{remaining} slots remaining</p>
      )}

      <span className="mt-5 inline-flex items-center gap-1.5 rounded-full bg-emerald-50 px-3 py-1 text-xs font-medium text-emerald-700 ring-1 ring-emerald-200 dark:bg-emerald-500/10 dark:text-emerald-400 dark:ring-emerald-500/20">
        <LockIcon /> Processed 100% locally in your browser
      </span>
    </div>
  )
}

function LockIcon() {
  return (
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" className="h-3.5 w-3.5">
      <rect x="5" y="11" width="14" height="9" rx="2" stroke="currentColor" strokeWidth="2" />
      <path d="M8 11V7a4 4 0 1 1 8 0v4" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
    </svg>
  )
}
