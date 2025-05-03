import type { Metadata } from 'next';
import { Noto_Sans_JP } from 'next/font/google';
import './globals.css';
import MatchingAppLayout from './MatchingAppLayout';

const notoSansJP = Noto_Sans_JP({ 
  weight: ['400', '500', '700'],
  subsets: ['latin'],
  display: 'swap',
});

export const metadata: Metadata = {
  title: 'RufulParty - マッチングアプリ',
  description: '婚活イベント向けマッチングシステム',
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="ja">
      <body className={notoSansJP.className}>
        <MatchingAppLayout>{children}</MatchingAppLayout>
      </body>
    </html>
  );
}
