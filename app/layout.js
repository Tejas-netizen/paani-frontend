import { Inter } from 'next/font/google';
import { ClerkProvider } from '@clerk/nextjs';
import './globals.css';

const inter = Inter({ subsets: ['latin'] });

export const metadata = {
  title: 'FloatChat - AI-Powered Oceanographic Data Analysis',
  description: 'Smart India Hackathon 2025 - Conversational system for ARGO NetCDF data analysis',
  keywords: 'oceanography, argo, netcdf, ai, hackathon, sih2025',
};

export default function RootLayout({ children }) {
  return (
    <ClerkProvider
      appearance={{
        baseTheme: undefined,
        variables: {
          colorPrimary: '#0284c7', // ocean-600
          colorBackground: '#ffffff',
          colorInputBackground: '#ffffff',
          colorInputText: '#000000',
        },
      }}
    >
      <html lang="en">
        <body className={inter.className}>
          <div className="min-h-screen bg-gradient-to-br from-ocean-50 to-argo-50">
            {children}
          </div>
        </body>
      </html>
    </ClerkProvider>
  );
}
