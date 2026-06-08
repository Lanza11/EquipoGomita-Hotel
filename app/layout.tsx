import type { Metadata } from 'next';
import { Geist, Geist_Mono, Public_Sans } from 'next/font/google';
import '@/app/globals.css';
import { cn } from '@/lib/utils';
import { Toaster } from '@/components/ui/sonner';

const publicSans = Public_Sans({ subsets: ['latin'], variable: '--font-sans' });

const geistSans = Geist({
  variable: '--font-geist-sans',
  subsets: ['latin'],
});

const geistMono = Geist_Mono({
  variable: '--font-geist-mono',
  subsets: ['latin'],
});

export const metadata: Metadata = {
  title: 'Hotel Admin',
  description: 'Hotel administration platform',
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang='es'
      className={cn(
        'h-full',
        'antialiased',
        geistSans.variable,
        geistMono.variable,
        'font-sans',
        publicSans.variable
      )}
    >
      <body className='min-h-full bg-background text-foreground'>
        {children}
        <Toaster />
      </body>
    </html>
  );
}
