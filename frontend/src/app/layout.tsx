import './globals.css';
import type { Metadata } from 'next';
import ClientLayoutWrapper from './ClientLayoutWrapper';

export const metadata: Metadata = {
  title: 'Meritmaster - PPSC Prep',
  description: 'The ultimate SaaS platform for PPSC, FPSC, NTS, and FIA exam preparation. Master your exams with our premium mock tests and study engine.',
  openGraph: {
    title: 'Meritmaster - PPSC Prep',
    description: 'The ultimate SaaS platform for PPSC, FPSC, NTS, and FIA exam preparation.',
    images: ['/images/og-card.png'],
  },
  robots: {
    index: true,
    follow: true,
  }
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link
          href="https://fonts.googleapis.com/css2?family=Noto+Nastaliq+Urdu:wght@400;500;600;700&family=Noto+Naskh+Arabic:wght@400;500;600;700&display=swap"
          rel="stylesheet"
        />
      </head>
      <body>
        <div className="orb-container">
          <div className="orb orb-1"></div>
          <div className="orb orb-2"></div>
          <div className="orb orb-3"></div>
        </div>

        <ClientLayoutWrapper>
          {children}
        </ClientLayoutWrapper>
      </body>
    </html>
  );
}
