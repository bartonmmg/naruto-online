import type { Metadata } from 'next'
import './globals.css'

export const metadata: Metadata = {
  title: 'HDRV - Comunidad Naruto Online',
  description: 'La plataforma de la comunidad de Naruto Online. Gana XP, sube de rango y domina el juego.',
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="es">
      <head>
        <meta charSet="utf-8" />
        <meta name="viewport" content="width=device-width, initial-scale=1" />
      </head>
      <body>{children}</body>
    </html>
  )
}
