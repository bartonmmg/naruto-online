'use client'

import { useEffect, useState } from 'react'
import { ChevronDown } from 'lucide-react'

interface TableOfContentsProps {
  content: string
}

interface Heading {
  id: string
  text: string
  level: number
}

export default function TableOfContents({ content }: TableOfContentsProps) {
  const [headings, setHeadings] = useState<Heading[]>([])
  const [isOpen, setIsOpen] = useState(false)

  useEffect(() => {
    // Extract headings from HTML content
    const headingRegex = /<h([1-3])(?:[^>]*)>(.*?)<\/h\1>/gi
    const foundHeadings: Heading[] = []
    let match

    while ((match = headingRegex.exec(content)) !== null) {
      const level = parseInt(match[1])
      const text = match[2].replace(/<[^>]*>/g, '') // Remove nested HTML tags
      const id = text
        .toLowerCase()
        .replace(/[^\w\s-]/g, '') // Remove special chars
        .replace(/\s+/g, '-') // Replace spaces with hyphens
        .replace(/-+/g, '-') // Remove multiple hyphens

      foundHeadings.push({ id, text, level })
    }

    setHeadings(foundHeadings)
  }, [content])

  if (headings.length === 0) {
    return null
  }

  const handleScroll = (id: string) => {
    // Find the closest matching heading in the DOM
    const elements = document.querySelectorAll('h1, h2, h3, h4, h5, h6')
    for (const element of elements) {
      const text = element.textContent?.toLowerCase().replace(/[^\w\s-]/g, '').replace(/\s+/g, '-').replace(/-+/g, '-')
      if (text === id) {
        element.scrollIntoView({ behavior: 'smooth', block: 'start' })
        setIsOpen(false)
        break
      }
    }
  }

  return (
    <div className="mb-8 lg:hidden">
      {/* Mobile collapsible */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="w-full flex items-center justify-between px-4 py-3 bg-bg-card border border-border rounded-lg text-white hover:border-chakra-blue/50 transition-colors"
      >
        <span className="font-montserrat font-semibold">Tabla de Contenidos</span>
        <ChevronDown className={`w-4 h-4 transition-transform ${isOpen ? 'rotate-180' : ''}`} />
      </button>

      {isOpen && (
        <div className="mt-2 p-4 bg-bg-card border border-border rounded-lg">
          <nav className="space-y-2">
            {headings.map(heading => (
              <button
                key={heading.id}
                onClick={() => handleScroll(heading.id)}
                className={`block text-left w-full text-sm hover:text-chakra-blue transition-colors ${
                  heading.level === 1
                    ? 'text-white font-semibold'
                    : heading.level === 2
                    ? 'text-white/80 pl-4'
                    : 'text-white/60 pl-8'
                }`}
              >
                {heading.text}
              </button>
            ))}
          </nav>
        </div>
      )}
    </div>
  )
}
