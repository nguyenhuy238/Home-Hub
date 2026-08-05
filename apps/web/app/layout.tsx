import type { Metadata } from 'next';
import './globals.css';

export const metadata: Metadata = {
  title: 'HomeHub — Catalog cửa hàng',
  description: 'Nền tảng giới thiệu sản phẩm và dịch vụ cho cửa hàng.',
};

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>): React.ReactNode {
  return (
    <html lang="vi" suppressHydrationWarning>
      <body>{children}</body>
    </html>
  );
}
