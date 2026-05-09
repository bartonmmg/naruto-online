'use client'

import { useState } from 'react'
import { Link2, Check, MessageCircle, Send } from 'lucide-react'

interface Props {
  title: string
  url: string
}

export default function ShareButtons({ title, url }: Props) {
  const [copied, setCopied] = useState(false)

  const text = `${title} — ${url}`
  const enc = (s: string) => encodeURIComponent(s)

  const links = {
    whatsapp: `https://wa.me/?text=${enc(text)}`,
    telegram: `https://t.me/share/url?url=${enc(url)}&text=${enc(title)}`,
    twitter:  `https://twitter.com/intent/tweet?text=${enc(title)}&url=${enc(url)}`,
  }

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(url)
      setCopied(true)
      setTimeout(() => setCopied(false), 1500)
    } catch {}
  }

  const btnCls =
    'flex items-center gap-1.5 px-3 h-8 rounded-lg text-xs font-montserrat font-semibold border transition-all'

  return (
    <div className="flex flex-wrap gap-2">
      <button onClick={handleCopy} className={`${btnCls} bg-white/5 text-white/60 border-border hover:text-white/90 hover:bg-white/10`}>
        {copied ? <Check className="w-3 h-3 text-green-400" /> : <Link2 className="w-3 h-3" />}
        {copied ? '¡Copiado!' : 'Copiar link'}
      </button>
      <a
        href={links.whatsapp}
        target="_blank"
        rel="noopener noreferrer"
        className={`${btnCls} bg-green-500/10 text-green-400 border-green-500/30 hover:bg-green-500/20`}
      >
        <MessageCircle className="w-3 h-3" />
        WhatsApp
      </a>
      <a
        href={links.telegram}
        target="_blank"
        rel="noopener noreferrer"
        className={`${btnCls} bg-chakra-blue/10 text-chakra-blue border-chakra-blue/30 hover:bg-chakra-blue/20`}
      >
        <Send className="w-3 h-3" />
        Telegram
      </a>
      <a
        href={links.twitter}
        target="_blank"
        rel="noopener noreferrer"
        className={`${btnCls} bg-white/5 text-white/60 border-border hover:text-white/90 hover:bg-white/10`}
      >
        <svg viewBox="0 0 24 24" className="w-3 h-3 fill-current"><path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z"/></svg>
        Twitter
      </a>
    </div>
  )
}
