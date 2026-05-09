import type { Metadata } from 'next'

interface NewsPostMeta {
  title: string
  content: string
  imageUrls: string[]
  category: string
  publishedAt: string
}

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'https://naruto-online.onrender.com'
const SITE_URL = 'https://naruto-online.netlify.app'

function plainTextExcerpt(content: string, max = 180): string {
  return content
    .replace(/^#{1,6}\s+/gm, '')
    .replace(/\*\*(.+?)\*\*/g, '$1')
    .replace(/\*(.+?)\*/g, '$1')
    .replace(/[_~`]/g, '')
    .replace(/\[([^\]]+)\]\([^)]+\)/g, '$1')
    .replace(/<a?:(\w+):\d+>/g, ':$1:')
    .replace(/\s+/g, ' ')
    .trim()
    .slice(0, max)
}

export async function generateMetadata(
  { params }: { params: Promise<{ id: string }> }
): Promise<Metadata> {
  const { id } = await params

  try {
    const res = await fetch(`${API_URL}/news/${id}`, { next: { revalidate: 300 } })
    if (!res.ok) throw new Error('not found')
    const post = await res.json() as NewsPostMeta

    const description = plainTextExcerpt(post.content) + '…'
    const image = post.imageUrls?.[0]
    const url = `${SITE_URL}/novedades/${id}`

    return {
      title: `${post.title} · Novedades — HDRV`,
      description,
      openGraph: {
        type: 'article',
        title: post.title,
        description,
        url,
        siteName: 'HDRV — Comunidad Naruto Online',
        ...(image ? { images: [{ url: image, alt: post.title }] } : {}),
        publishedTime: post.publishedAt,
        section: post.category,
      },
      twitter: {
        card: image ? 'summary_large_image' : 'summary',
        title: post.title,
        description,
        ...(image ? { images: [image] } : {}),
      },
    }
  } catch {
    return {
      title: 'Novedades — HDRV',
      description: 'Actualizaciones del servidor de China y próximos cambios',
    }
  }
}

export default function NovedadDetailLayout({ children }: { children: React.ReactNode }) {
  return children
}
