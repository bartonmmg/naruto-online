'use client'

import LoadingSpinner from '@/components/LoadingSpinner'

export default function StatsSkeleton() {
  return (
    <LoadingSpinner
      message="Analizando datos de ranking"
      size="md"
    />
  )
}
