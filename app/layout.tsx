import type { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'Auto Dev Engine',
  description: 'Automated development engine',
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
