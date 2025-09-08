// Blog removed: no Sanity live components
import '@/styles/tailwind.css'
import type { Metadata } from 'next'

export const metadata: Metadata = {
  title: {
    template: '%s - Crove',
    default: 'Crove - Build autonomous AI workflows',
  },
  description:
    'Crove giúp doanh nghiệp xây dựng quy trình AI tự động hoá: orchestration, tools, observability và governance.',
  metadataBase:
    new URL(process.env.NEXT_PUBLIC_SITE_URL || 'http://localhost:3010'),
  openGraph: {
    title: 'Crove',
    description:
      'Tạo tác nhân và workflow AI end‑to‑end, tích hợp hệ thống sẵn có.',
    url: '/',
    siteName: 'Crove',
    locale: 'vi_VN',
    type: 'website',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Crove',
    description:
      'Tạo tác nhân và workflow AI end‑to‑end, tích hợp hệ thống sẵn có.',
  },
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <html lang="en">
      <head>
        <link
          rel="stylesheet"
          href="https://api.fontshare.com/css?f%5B%5D=switzer@400,500,600,700&amp;display=swap"
        />
        {/* Blog RSS removed */}
      </head>
      <body className="text-gray-950 antialiased">
        {children}
        {/* Sanity live removed */}
      </body>
    </html>
  )
}
