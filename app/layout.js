import { Inter, Playfair_Display } from 'next/font/google'
import './globals.css'
import { Toaster } from 'react-hot-toast'
import ClientProvider from './components/ClientProvider'

const inter = Inter({
  subsets: ['latin'],
  variable: '--font-inter',
  display: 'swap',
})

const playfair = Playfair_Display({
  subsets: ['latin'],
  variable: '--font-playfair',
  display: 'swap',
})

export const metadata = {
  title: 'Dimplesluxe - Premium Human Hair',
  description: 'Discover premium human hair bundles, extensions and luxury hair products from Dimplesluxe. Quality guaranteed.',
  keywords: 'human hair, bundles, extensions, premium hair, luxury hair, body wave, curly hair',
}

export default function RootLayout({ children }) {
  return (
    <html lang="en" className={`${inter.variable} ${playfair.variable}`}>
      <body className={`${inter.className} antialiased`}>
        <ClientProvider>
          {children}
          <Toaster 
            position="top-right"
            toastOptions={{
              duration: 4000,
              style: {
                background: '#1f2937',
                color: '#fff',
                borderRadius: '10px',
              },
              success: {
                iconTheme: {
                  primary: '#ec4899',
                  secondary: '#fff',
                },
              },
            }}
          />
        </ClientProvider>
      </body>
    </html>
  )
}