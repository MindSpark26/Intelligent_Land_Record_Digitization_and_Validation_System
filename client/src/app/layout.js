import './globals.css';
import Sidebar from '@/components/Sidebar';

export const metadata = {
  title: 'Land AI: Digital India — AI Land Record Digitization',
  description:
    'Next-generation AI-powered platform for digitizing and managing land records under the Digital India initiative. Upload, process, and validate scanned land documents.',
};

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link
          href="https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700&display=swap"
          rel="stylesheet"
        />
      </head>
      <body className="font-sans" style={{ fontFamily: "'Inter', sans-serif" }}>
        <div className="flex min-h-screen">
          <Sidebar />
          <main className="flex-1 ml-64">
            {/* Top bar */}
            <header className="sticky top-0 z-40 bg-white/80 backdrop-blur-md border-b border-slate-200/60 px-8 py-4">
              <div className="flex items-center justify-between">
                <div />
                <div className="flex items-center gap-3">
                  <span className="text-xs text-slate-400 font-medium">Phase 1 • SIH 2026</span>
                  <div className="w-8 h-8 rounded-full bg-slate-900 flex items-center justify-center text-white text-xs font-semibold">
                    AI
                  </div>
                </div>
              </div>
            </header>
            {/* Page content */}
            <div className="p-8">{children}</div>
          </main>
        </div>
      </body>
    </html>
  );
}
