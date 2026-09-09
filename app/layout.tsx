import type { Metadata } from 'next';
import './globals.css';

export const metadata: Metadata = {
  title: 'StarBound — Dyson Swarm Laboratory',
  description:
    'Build a star-powered future. An open, physics-constrained Dyson swarm simulator with Astra-directed experiments, material accounting and an Earth power-link budget.',
  metadataBase: new URL('https://starbound.vnmoorthy.chatgpt.site'),
  openGraph: {
    title: 'StarBound — Build a star-powered future',
    description:
      'From Mercury resources to a solar swarm. Explore the engineering, test the limits, and let Astra revise the plan.',
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className="dark">
      <body className="antialiased">{children}</body>
    </html>
  );
}
