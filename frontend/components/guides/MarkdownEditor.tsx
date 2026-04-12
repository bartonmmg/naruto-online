'use client'

import { useState, useRef, useEffect } from 'react'
import { Bold, Italic, Link2, Image, Video, Heading1, Heading2, Heading3, List, ListOrdered, Quote, Code, Trash2, Copy, Palette } from 'lucide-react'

interface MarkdownEditorProps {
  value: string
  onChange: (value: string) => void
}

export function MarkdownEditor({ value, onChange }: MarkdownEditorProps) {
  const editorRef = useRef<HTMLDivElement>(null)
  const [isFocused, setIsFocused] = useState(false)
  const [showColorPicker, setShowColorPicker] = useState(false)
  const [activeFormat, setActiveFormat] = useState<Set<string>>(new Set())

  useEffect(() => {
    if (editorRef.current && value && editorRef.current.innerHTML !== value) {
      editorRef.current.innerHTML = value
    }
  }, [])

  const applyFormat = (command: string, value?: string) => {
    editorRef.current?.focus()
    setTimeout(() => {
      try {
        if (value) {
          document.execCommand(command, false, value)
        } else {
          document.execCommand(command, false, undefined)
        }
        updateMarkdown()
      } catch (e) {
        console.error('Format error:', e)
      }
    }, 0)
  }

  const updateMarkdown = () => {
    if (editorRef.current) {
      const content = editorRef.current.innerHTML
      onChange(content)
    }
  }

  const clearEditor = () => {
    if (editorRef.current) {
      editorRef.current.innerHTML = ''
      updateMarkdown()
      editorRef.current.focus()
    }
  }

  const copyContent = () => {
    if (editorRef.current) {
      const content = editorRef.current.innerText
      navigator.clipboard.writeText(content)
    }
  }

  const handleKeyDown = (e: React.KeyboardEvent<HTMLDivElement>) => {
    if (e.key === 'Tab') {
      e.preventDefault()
      document.execCommand('insertHTML', false, '&nbsp;&nbsp;&nbsp;&nbsp;')
      updateMarkdown()
    }

    if (e.ctrlKey || e.metaKey) {
      if (e.key === 'b') {
        e.preventDefault()
        applyFormat('bold')
      } else if (e.key === 'i') {
        e.preventDefault()
        applyFormat('italic')
      } else if (e.key === 'u') {
        e.preventDefault()
        applyFormat('underline')
      } else if (e.key === 'k') {
        e.preventDefault()
        const url = prompt('Ingresa la URL:')
        if (url) applyFormat('createLink', url)
      }
    }
  }

  const handleFocus = () => {
    setIsFocused(true)
  }

  const handleInput = () => {
    updateMarkdown()
    updateActiveFormat()
  }

  const updateActiveFormat = () => {
    const formats = new Set<string>()
    if (document.queryCommandState('bold')) formats.add('bold')
    if (document.queryCommandState('italic')) formats.add('italic')
    if (document.queryCommandState('underline')) formats.add('underline')
    if (document.queryCommandState('strikeThrough')) formats.add('strikeThrough')
    setActiveFormat(formats)
  }

  const isFormatActive = (format: string): boolean => {
    return activeFormat.has(format)
  }

  const applyColor = (color: string) => {
    applyFormat('foreColor', color)
    setShowColorPicker(false)
  }

  const applyHighlight = (color: string) => {
    applyFormat('backColor', color)
    setShowColorPicker(false)
  }

  const colors = ['#FF6B00', '#FF0000', '#00AA00', '#0099FF', '#FFFF00', '#FF00FF', '#00FFFF', '#FFFFFF', '#999999']

  return (
    <div className="border border-border/50 rounded-xl overflow-hidden bg-bg-card flex flex-col h-full shadow-lg flex-1">
      {/* Toolbar - Sticky */}
      <div className="sticky top-0 z-10 bg-gradient-to-r from-bg-elevated to-bg-elevated/80 border-b border-border/30 px-4 py-3 flex items-center gap-2 flex-wrap">
        {/* Formatting */}
        <div className="flex items-center gap-1 bg-bg-primary/30 rounded-lg p-1">
          <button
            onMouseDown={(e) => {
              e.preventDefault()
              applyFormat('bold')
              updateActiveFormat()
            }}
            className={`p-2.5 rounded transition-colors ${isFormatActive('bold') ? 'bg-accent-orange/40 text-accent-orange' : 'hover:bg-accent-orange/20 text-white/70 hover:text-accent-orange'}`}
            title="Negrita (Ctrl+B)"
          >
            <Bold className="w-4 h-4" />
          </button>
          <button
            onMouseDown={(e) => {
              e.preventDefault()
              applyFormat('italic')
              updateActiveFormat()
            }}
            className={`p-2.5 rounded transition-colors ${isFormatActive('italic') ? 'bg-accent-orange/40 text-accent-orange' : 'hover:bg-accent-orange/20 text-white/70 hover:text-accent-orange'}`}
            title="Cursiva (Ctrl+I)"
          >
            <Italic className="w-4 h-4" />
          </button>
          <button
            onMouseDown={(e) => {
              e.preventDefault()
              applyFormat('underline')
              updateActiveFormat()
            }}
            className={`p-2.5 rounded transition-colors ${isFormatActive('underline') ? 'bg-accent-orange/40 text-accent-orange' : 'hover:bg-accent-orange/20 text-white/70 hover:text-accent-orange'}`}
            title="Subrayado (Ctrl+U)"
          >
            <u className="text-sm font-bold">U</u>
          </button>
          <button
            onMouseDown={(e) => {
              e.preventDefault()
              applyFormat('strikeThrough')
              updateActiveFormat()
            }}
            className={`p-2.5 rounded transition-colors ${isFormatActive('strikeThrough') ? 'bg-accent-orange/40 text-accent-orange' : 'hover:bg-accent-orange/20 text-white/70 hover:text-accent-orange'}`}
            title="Tachado"
          >
            <s className="text-sm font-bold">S</s>
          </button>
        </div>

        <div className="w-px h-6 bg-border/30" />

        {/* Headings */}
        <div className="flex items-center gap-1 bg-bg-primary/30 rounded-lg p-1">
          <button
            onMouseDown={(e) => {
              e.preventDefault()
              editorRef.current?.focus()
              setTimeout(() => {
                document.execCommand('formatBlock', false, 'h1')
                updateMarkdown()
              }, 0)
            }}
            className="p-2.5 hover:bg-accent-orange/20 rounded transition-colors text-white/70 hover:text-accent-orange"
            title="Encabezado H1"
          >
            <Heading1 className="w-4 h-4" />
          </button>
          <button
            onMouseDown={(e) => {
              e.preventDefault()
              editorRef.current?.focus()
              setTimeout(() => {
                document.execCommand('formatBlock', false, 'h2')
                updateMarkdown()
              }, 0)
            }}
            className="p-2.5 hover:bg-accent-orange/20 rounded transition-colors text-white/70 hover:text-accent-orange"
            title="Encabezado H2"
          >
            <Heading2 className="w-4 h-4" />
          </button>
          <button
            onMouseDown={(e) => {
              e.preventDefault()
              editorRef.current?.focus()
              setTimeout(() => {
                document.execCommand('formatBlock', false, 'h3')
                updateMarkdown()
              }, 0)
            }}
            className="p-2.5 hover:bg-accent-orange/20 rounded transition-colors text-white/70 hover:text-accent-orange"
            title="Encabezado H3"
          >
            <Heading3 className="w-4 h-4" />
          </button>
          <button
            onMouseDown={(e) => {
              e.preventDefault()
              editorRef.current?.focus()
              setTimeout(() => {
                document.execCommand('formatBlock', false, 'p')
                updateMarkdown()
              }, 0)
            }}
            className="p-2.5 hover:bg-accent-orange/20 rounded transition-colors text-white/70 hover:text-accent-orange text-xs font-bold"
            title="Párrafo normal"
          >
            P
          </button>
        </div>

        <div className="w-px h-6 bg-border/30" />

        {/* Lists */}
        <div className="flex items-center gap-1 bg-bg-primary/30 rounded-lg p-1">
          <button
            onMouseDown={(e) => {
              e.preventDefault()
              editorRef.current?.focus()
              setTimeout(() => {
                document.execCommand('insertUnorderedList')
                updateMarkdown()
              }, 0)
            }}
            className="p-2.5 hover:bg-accent-orange/20 rounded transition-colors text-white/70 hover:text-accent-orange"
            title="Lista con viñetas"
          >
            <List className="w-4 h-4" />
          </button>
          <button
            onMouseDown={(e) => {
              e.preventDefault()
              editorRef.current?.focus()
              setTimeout(() => {
                document.execCommand('insertOrderedList')
                updateMarkdown()
              }, 0)
            }}
            className="p-2.5 hover:bg-accent-orange/20 rounded transition-colors text-white/70 hover:text-accent-orange"
            title="Lista numerada"
          >
            <ListOrdered className="w-4 h-4" />
          </button>
          <button
            onMouseDown={(e) => {
              e.preventDefault()
              applyFormat('indent')
            }}
            className="p-2.5 hover:bg-accent-orange/20 rounded transition-colors text-white/70 hover:text-accent-orange text-xs font-bold"
            title="Indentar"
          >
            →
          </button>
          <button
            onMouseDown={(e) => {
              e.preventDefault()
              applyFormat('outdent')
            }}
            className="p-2.5 hover:bg-accent-orange/20 rounded transition-colors text-white/70 hover:text-accent-orange text-xs font-bold"
            title="Reducir indentación"
          >
            ←
          </button>
        </div>

        <div className="w-px h-6 bg-border/30" />

        {/* Code & Quote */}
        <div className="flex items-center gap-1 bg-bg-primary/30 rounded-lg p-1">
          <button
            onMouseDown={(e) => {
              e.preventDefault()
              editorRef.current?.focus()
              setTimeout(() => {
                document.execCommand('formatBlock', false, 'pre')
                updateMarkdown()
              }, 0)
            }}
            className="p-2.5 hover:bg-accent-orange/20 rounded transition-colors text-white/70 hover:text-accent-orange"
            title="Bloque de código"
          >
            <Code className="w-4 h-4" />
          </button>
          <button
            onMouseDown={(e) => {
              e.preventDefault()
              editorRef.current?.focus()
              setTimeout(() => {
                document.execCommand('formatBlock', false, 'blockquote')
                updateMarkdown()
              }, 0)
            }}
            className="p-2.5 hover:bg-accent-orange/20 rounded transition-colors text-white/70 hover:text-accent-orange"
            title="Cita"
          >
            <Quote className="w-4 h-4" />
          </button>
        </div>

        <div className="w-px h-6 bg-border/30" />

        {/* Links & Media */}
        <div className="flex items-center gap-1 bg-bg-primary/30 rounded-lg p-1">
          <button
            onMouseDown={(e) => {
              e.preventDefault()
              const url = prompt('Ingresa la URL:')
              if (url) applyFormat('createLink', url)
            }}
            className="p-2.5 hover:bg-accent-orange/20 rounded transition-colors text-white/70 hover:text-accent-orange"
            title="Enlace (Ctrl+K)"
          >
            <Link2 className="w-4 h-4" />
          </button>
          <button
            onMouseDown={(e) => {
              e.preventDefault()
              const url = prompt('Ingresa la URL de la imagen:')
              if (url) applyFormat('insertImage', url)
            }}
            className="p-2.5 hover:bg-accent-orange/20 rounded transition-colors text-white/70 hover:text-accent-orange"
            title="Imagen"
          >
            <Image className="w-4 h-4" />
          </button>
          <button
            onMouseDown={(e) => {
              e.preventDefault()
              const url = prompt('Ingresa la URL de YouTube (ej: https://www.youtube.com/watch?v=...):')
              if (url) {
                const videoId = url.match(/(?:youtube\.com\/watch\?v=|youtu\.be\/)([^&\n?#]+)/)?.[1]
                if (videoId) {
                  document.execCommand(
                    'insertHTML',
                    false,
                    `<div style="margin: 1em 0;"><iframe width="100%" height="315" src="https://www.youtube.com/embed/${videoId}" frameborder="0" allowfullscreen style="border-radius: 6px;"></iframe></div>`
                  )
                  updateMarkdown()
                } else {
                  alert('URL de YouTube no válida')
                }
              }
            }}
            className="p-2.5 hover:bg-accent-orange/20 rounded transition-colors text-white/70 hover:text-accent-orange"
            title="Video YouTube"
          >
            <Video className="w-4 h-4" />
          </button>
        </div>

        <div className="w-px h-6 bg-border/30" />

        {/* Colors */}
        <div className="relative">
          <button
            onMouseDown={(e) => {
              e.preventDefault()
              setShowColorPicker(!showColorPicker)
            }}
            className="p-2.5 hover:bg-accent-orange/20 rounded transition-colors text-white/70 hover:text-accent-orange bg-bg-primary/30"
            title="Colores"
          >
            <Palette className="w-4 h-4" />
          </button>

          {showColorPicker && (
            <div className="absolute top-12 left-0 bg-bg-elevated border border-border/50 rounded-lg p-3 z-50 shadow-xl">
              <div className="text-xs text-white/60 mb-2 font-semibold">Color de texto</div>
              <div className="grid grid-cols-3 gap-2 mb-3">
                {colors.map((color) => (
                  <button
                    key={color}
                    onMouseDown={(e) => {
                      e.preventDefault()
                      applyColor(color)
                    }}
                    className="w-6 h-6 rounded border border-white/20 hover:border-white/50 transition-colors"
                    style={{ backgroundColor: color }}
                    title={color}
                  />
                ))}
              </div>
              <div className="text-xs text-white/60 mb-2 font-semibold">Fondo</div>
              <div className="grid grid-cols-3 gap-2">
                {colors.map((color) => (
                  <button
                    key={`bg-${color}`}
                    onMouseDown={(e) => {
                      e.preventDefault()
                      applyHighlight(color)
                    }}
                    className="w-6 h-6 rounded border border-white/20 hover:border-white/50 transition-colors"
                    style={{ backgroundColor: color }}
                    title={`Fondo: ${color}`}
                  />
                ))}
              </div>
            </div>
          )}
        </div>

        <div className="w-px h-6 bg-border/30" />

        {/* Utilities */}
        <div className="flex items-center gap-1 bg-bg-primary/30 rounded-lg p-1">
          <button
            onMouseDown={(e) => {
              e.preventDefault()
              copyContent()
            }}
            className="p-2.5 hover:bg-accent-orange/20 rounded transition-colors text-white/70 hover:text-accent-orange"
            title="Copiar contenido"
          >
            <Copy className="w-4 h-4" />
          </button>
          <button
            onMouseDown={(e) => {
              e.preventDefault()
              clearEditor()
            }}
            className="p-2.5 hover:bg-red-500/20 rounded transition-colors text-white/70 hover:text-red-400"
            title="Limpiar editor"
          >
            <Trash2 className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Editor contentEditable - ÁREA MUCHO MÁS GRANDE */}
      <div
        ref={editorRef}
        contentEditable
        suppressContentEditableWarning
        onInput={handleInput}
        onKeyDown={handleKeyDown}
        onFocus={handleFocus}
        onBlur={() => setIsFocused(false)}
        className="flex-1 px-8 py-12 bg-bg-primary text-text-primary text-base outline-none overflow-y-auto break-words leading-relaxed relative w-full"
        style={{
          caretColor: '#FF6B00',
          flex: 1,
          height: '100%',
        }}
        data-placeholder="Escribe aquí... Usa los botones para dar formato"
      />

      {/* Status bar */}
      <div className="bg-bg-elevated border-t border-border/30 px-4 py-2 flex justify-between items-center text-xs text-white/50">
        <div>
          {editorRef.current?.innerText.length || 0} caracteres
        </div>
        <div>
          Edición en tiempo real
        </div>
      </div>
    </div>
  )
}
