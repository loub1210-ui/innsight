import type { Metadata } from 'next'
import { Inter } from 'next/font/google'
import './globals.css'
import { Providers } from '@/components/layout/Providers'

const inter = Inter({ subsets: ['latin'], variable: '--font-inter' })

export const metadata: Metadata = {
  title: {
    default: 'InnSight — Intelligence Foncière Hôtelière',
    template: '%s | InnSight',
  },
  description: 'Plateforme d\'analyse et d\'investissement pour le foncier hôtelier',
  icons: { icon: '/favicon.ico' },
}

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="fr" suppressHydrationWarning>
      <body className={inter.variable}>
        <Providers>{children}</Providers>
      </body>
    </html>
  )
}
