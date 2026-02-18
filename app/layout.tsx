import React from "react"
import type { Metadata } from 'next'
import { Geist, Geist_Mono } from 'next/font/google'
import { Analytics } from '@vercel/analytics/next'
import { AuthProvider } from '@/components/auth-provider'
import './globals.css'

const _geist = Geist({
  subsets: ["latin"],
  variable: '--font-geist-sans',
});
const _geistMono = Geist_Mono({
  subsets: ["latin"],
  variable: '--font-geist-mono',
});

export const metadata: Metadata = {
  title: 'badmintonzone.com | Premium Badminton Court Booking',
  description: 'Book world-class badminton courts easily. The premium experience for racket athletes.',
  icons: {
    icon: [
      {
        url: '/logo-main.png',
        media: '(prefers-color-scheme: light)',
      },
      {
        url: '/logo-main.png',
        media: '(prefers-color-scheme: dark)',
      },
      {
        url: '/icon.svg',
        type: 'image/svg+xml',
      },
    ],
    apple: '/apple-icon.png',
  },
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <html lang="en">
      <body className={`${_geist.variable} ${_geistMono.variable} font-sans antialiased`}>
        <AuthProvider>
          {children}
        </AuthProvider>
        <Analytics />
      </body>
    </html>
  )
}
