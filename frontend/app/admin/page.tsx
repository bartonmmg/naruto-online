'use client'

import { useEffect } from 'react'
import { useRouter } from 'next/navigation'

// Redirect /admin → /admin/xp
export default function AdminRoot() {
  const router = useRouter()
  useEffect(() => { router.replace('/admin/xp') }, [router])
  return null
}
