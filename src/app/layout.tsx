import type { Metadata } from 'next';
import { Inter } from 'next/font/google';
import './globals.css';
import { AuthProvider } from './providers';
import { Toaster } from "@/components/ui/sonner";

const inter = Inter({ subsets: ['latin'] });

export const metadata: Metadata = {
  title: 'Bidding System',
  description: 'A simple bidding system built with Next.js, Shadcn/UI, and Prisma',
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className={inter.className}>
        <AuthProvider>
          {children}
          <Toaster />
        </AuthProvider>
      </body>
    </html>
  );
}