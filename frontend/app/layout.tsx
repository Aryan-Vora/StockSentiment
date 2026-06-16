import type React from 'react';
import './globals.css';
import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'StockSentiment - Reddit vs. the stock chart',
  description:
    'A free experiment that compares Reddit stock sentiment with real price movement.',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  );
}
