import type { Metadata } from 'next'
import './globals.css'

export const metadata: Metadata = {
  title: 'Coda - Web3 No-Code Builder',
  description: 'AI-powered no-code builder for Solana programs',
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  )
}

