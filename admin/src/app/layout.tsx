import type { Metadata } from 'next';
import { Inter } from 'next/font/google';
import './globals.css';
import AdminLayout from './AdminLayout';

const inter = Inter({ subsets: ['latin'] });

export const metadata: Metadata = {
  title: '管理画面',
  description: '複数パーティ対応の婚活イベント向けマッチングシステム',
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="ja">
      <body className={inter.className}>
        <AdminLayout>{children}</AdminLayout>
      </body>
    </html>
  );
}
