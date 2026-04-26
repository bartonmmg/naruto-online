export default function StatsSkeleton() {
  return (
    <div className="space-y-6 animate-pulse">
      {/* Date selector skeleton */}
      <div className="h-16 bg-white/5 rounded-xl" />

      {/* Section title skeleton */}
      <div className="space-y-2 mb-6">
        <div className="h-8 w-96 bg-white/5 rounded" />
        <div className="h-4 w-80 bg-white/5 rounded" />
      </div>

      {/* Dominance banner */}
      <div className="h-12 bg-white/5 rounded-xl" />

      {/* Stat cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
        <div className="h-48 bg-white/5 rounded-2xl" />
        <div className="h-48 bg-white/5 rounded-2xl" />
      </div>

      {/* Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="h-72 bg-white/5 rounded-2xl" />
        <div className="h-72 bg-white/5 rounded-2xl" />
      </div>

      {/* Leaderboard */}
      <div className="h-64 bg-white/5 rounded-2xl" />
    </div>
  )
}
