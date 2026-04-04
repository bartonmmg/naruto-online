'use client'

const COLORS = [
  'rgba(255,107,0,0.5)',
  'rgba(255,107,0,0.3)',
  'rgba(0,128,255,0.35)',
  'rgba(255,215,0,0.3)',
  'rgba(204,0,0,0.25)',
]

const PARTICLES = Array.from({ length: 20 }, (_, i) => ({
  id: i,
  left:     (5 + (i * 4.7) % 90).toFixed(1),
  size:     (1.2 + (i * 0.37) % 2.5).toFixed(2),
  duration: (10 + (i * 1.3) % 10).toFixed(1),
  delay:    ((i * 0.7) % 8).toFixed(1),
  color:    COLORS[i % COLORS.length],
}))

export default function FloatingParticles() {
  return (
    <div className="fixed inset-0 pointer-events-none overflow-hidden z-0">
      {PARTICLES.map(p => (
        <div
          key={p.id}
          className="absolute rounded-full"
          style={{
            left:    `${p.left}%`,
            bottom:  '-4px',
            width:   `${p.size}px`,
            height:  `${p.size}px`,
            background: p.color,
            animation: `floatUp ${p.duration}s linear ${p.delay}s infinite`,
            filter: `blur(1px)`,
          }}
        />
      ))}
    </div>
  )
}
