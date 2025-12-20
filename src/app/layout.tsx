import type { Metadata } from 'next'
import { Crimson_Pro } from 'next/font/google'
import './globals.css'
import { Sidebar } from '@/components/sidebar'

const crimsonPro = Crimson_Pro({
  variable: '--font-crimson',
  subsets: ['latin'],
  display: 'swap',
})

export const metadata: Metadata = {
  title: 'thePile',
  description: 'Turn passive reading into active learning',
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <html lang="en">
      <body className={`${crimsonPro.variable} antialiased`}>
        <div className="flex h-screen bg-[#FDFCFB]">
          <Sidebar />
          <main className="flex-1 overflow-auto">{children}</main>
        </div>
      </body>
    </html>
  )
}
