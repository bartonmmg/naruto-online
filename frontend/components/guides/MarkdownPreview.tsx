'use client'

import { useMemo } from 'react'
import { MarkdownRenderer } from './MarkdownRenderer'

interface MarkdownPreviewProps {
  content: string
}

export function MarkdownPreview({ content }: MarkdownPreviewProps) {
  const isEmpty = useMemo(() => {
    return !content || content.trim().length === 0
  }, [content])

  return (
    <div className="h-full bg-bg-card border border-border/50 rounded-lg p-6 overflow-y-auto">
      {isEmpty ? (
        <div className="flex flex-col items-center justify-center h-full text-white/40">
          <p className="text-sm font-montserrat">Tu contenido aparecerá aquí...</p>
        </div>
      ) : (
        <div className="prose prose-invert max-w-none">
          <MarkdownRenderer content={content} />
        </div>
      )}
    </div>
  )
}
