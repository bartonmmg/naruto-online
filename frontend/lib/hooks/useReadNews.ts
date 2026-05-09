'use client'

import { useEffect, useState, useCallback } from 'react'

const STORAGE_KEY = 'news-read-ids'
const NEW_THRESHOLD_DAYS = 7

function load(): Set<string> {
  if (typeof window === 'undefined') return new Set()
  try {
    const raw = localStorage.getItem(STORAGE_KEY)
    return raw ? new Set(JSON.parse(raw)) : new Set()
  } catch { return new Set() }
}

function save(ids: Set<string>) {
  try { localStorage.setItem(STORAGE_KEY, JSON.stringify(Array.from(ids))) } catch {}
}

export function useReadNews() {
  const [readIds, setReadIds] = useState<Set<string>>(new Set())

  useEffect(() => { setReadIds(load()) }, [])

  const markRead = useCallback((id: string) => {
    setReadIds(prev => {
      if (prev.has(id)) return prev
      const next = new Set(prev)
      next.add(id)
      save(next)
      return next
    })
  }, [])

  const isRead   = useCallback((id: string) => readIds.has(id), [readIds])
  const isRecent = useCallback((publishedAt: string) => {
    const ageDays = (Date.now() - new Date(publishedAt).getTime()) / (1000 * 60 * 60 * 24)
    return ageDays < NEW_THRESHOLD_DAYS
  }, [])
  const isNew = useCallback((id: string, publishedAt: string) => {
    return isRecent(publishedAt) && !readIds.has(id)
  }, [readIds, isRecent])

  return { isRead, isNew, markRead, isRecent }
}
