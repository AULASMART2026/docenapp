import type { Metadata } from 'next'
import { Inter } from 'next/font/google'
import './globals.css'

const inter = Inter({ subsets: ['latin'] })

export const metadata: Metadata = {
  title: 'DocenApp — Herramientas para Docentes Chilenos',
  description: 'Genera rubricas, planificaciones, evaluaciones e informes PIE con IA. Gratis para profesores chilenos.',
}

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang='es'>
      <body className={inter.className}>{children}</body>
    </html>
  )
}
