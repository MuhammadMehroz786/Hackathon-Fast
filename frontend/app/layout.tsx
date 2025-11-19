import type { Metadata } from 'next'
import './globals.css'

export const metadata: Metadata = {
  title: 'Project Barfani - Glacier Monitoring System',
  description: 'Real-time glacier monitoring and GLOF early warning system for Northern Pakistan',
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en">
      <body className="bg-gray-50">
        {children}
      </body>
    </html>
  )
}
