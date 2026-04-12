interface MarkdownRendererProps {
  content: string
}

export function MarkdownRenderer({ content }: MarkdownRendererProps) {
  if (!content) return null

  // Sanitizar y renderizar HTML directamente
  let sanitizedContent = content
    .replace(/javascript:/gi, '')
    .replace(/on\w+\s*=/gi, '')
    .replace(/<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gi, '')
    .replace(/<iframe\b[^<]*(?:(?!<\/iframe>)<[^<]*)*<\/iframe>/gi, '')

  // Agregar estilos inline a elementos HTML
  // Primero, reemplazar etiquetas que pueden tener estilos ya
  sanitizedContent = sanitizedContent
    .replace(/<h1([^>]*)>/gi, '<h1$1 style="font-size: 2em; font-weight: bold; margin: 0.8em 0 0.4em 0; color: #ffffff;"')
    .replace(/<h2([^>]*)>/gi, '<h2$1 style="font-size: 1.6em; font-weight: bold; margin: 0.8em 0 0.4em 0; color: #ffffff;"')
    .replace(/<h3([^>]*)>/gi, '<h3$1 style="font-size: 1.3em; font-weight: bold; margin: 0.8em 0 0.4em 0; color: #ffffff;"')
    .replace(/<p([^>]*)>/gi, '<p$1 style="margin-bottom: 1em; line-height: 1.6; color: #e0e0e0;"')
    .replace(/<strong([^>]*)>/gi, '<strong$1 style="font-weight: bold; color: #ffffff;"')
    .replace(/<em([^>]*)>/gi, '<em$1 style="font-style: italic; color: #e0e0e0;"')
    .replace(/<blockquote([^>]*)>/gi, '<blockquote$1 style="border-left: 4px solid #FF6B00; padding-left: 1em; margin: 1em 0; font-style: italic; color: #b0b0b0;"')
    .replace(/<code([^>]*)>/gi, '<code$1 style="background-color: #1a1a1a; padding: 2px 6px; border-radius: 3px; font-family: monospace; font-size: 0.9em; color: #00ff00;"')
    .replace(/<pre([^>]*)>/gi, '<pre$1 style="background-color: #1a1a1a; padding: 12px; border-radius: 6px; overflow-x: auto; margin: 1em 0; font-family: monospace; line-height: 1.5; color: #00ff00;"')
    .replace(/<ul([^>]*)>/gi, '<ul$1 style="list-style-type: disc; margin-left: 2em; margin-bottom: 1em;"')
    .replace(/<ol([^>]*)>/gi, '<ol$1 style="list-style-type: decimal; margin-left: 2em; margin-bottom: 1em;"')
    .replace(/<li([^>]*)>/gi, '<li$1 style="margin-bottom: 0.5em; color: #e0e0e0;"')
    .replace(/<a([^>]*)>/gi, '<a$1 style="color: #0099FF; text-decoration: underline; cursor: pointer;"')
    .replace(/<img([^>]*)>/gi, '<img$1 style="max-width: 100%; height: auto; border-radius: 6px; margin: 1em 0;"')

  return (
    <div
      className="text-text-primary text-base leading-relaxed"
      dangerouslySetInnerHTML={{
        __html: sanitizedContent,
      }}
    />
  )
}
