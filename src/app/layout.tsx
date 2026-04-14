import type { Metadata } from "next"
import "./globals.css"

export const metadata: Metadata = {
  title: "Gabriela's Premier Pet Care — Trusted Dog Sitting & Pet Care in Orlando, FL",
  description:
    "Trusted dog sitting, dog walking, drop-in visits, and overnight pet care in the Orlando, FL area.",
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <html lang="en" className="h-full antialiased">
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link
          href="https://fonts.googleapis.com/css2?family=Bitter:ital,wght@0,400;0,600;0,700;1,400&family=Young+Serif&display=swap"
          rel="stylesheet"
        />
      </head>
      <body className="min-h-full flex flex-col font-body bg-brand-bg">{children}</body>
    </html>
  )
}
