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
                <div className="flex items-center gap-2">
                  <div className="w-8 h-8 rounded-lg bg-orange-500 flex items-center justify-center text-white">
                    <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                      <path strokeLinecap="round" strokeLinejoin="round" d="M3.75 6A2.25 2.25 0 016 3.75h2.25A2.25 2.25 0 0110.5 6v2.25a2.25 2.25 0 01-2.25 2.25H6a2.25 2.25 0 01-2.25-2.25V6zM3.75 15.75A2.25 2.25 0 016 13.5h2.25a2.25 2.25 0 012.25 2.25V18a2.25 2.25 0 01-2.25 2.25H6A2.25 2.25 0 013.75 18v-2.25zM13.5 6a2.25 2.25 0 012.25-2.25H18A2.25 2.25 0 0120.25 6v2.25A2.25 2.25 0 0118 10.5h-2.25a2.25 2.25 0 01-2.25-2.25V6zM13.5 15.75a2.25 2.25 0 012.25-2.25H18a2.25 2.25 0 012.25 2.25V18A2.25 2.25 0 0118 20.25h-2.25A2.25 2.25 0 0113.5 18v-2.25z" />
                    </svg>
                  </div>
                  <h1 className="text-lg sm:text-xl font-bold text-slate-900 tracking-tight">Intelligent Land Record Digitization and Validation System</h1>
                </div>
                <div className="flex items-center gap-3">
                  <span className="text-xs text-slate-400 font-medium tracking-wide uppercase">Phase 1 • SIH 2026</span>
                  <div className="w-8 h-8 rounded-full bg-slate-900 flex items-center justify-center text-white text-xs font-semibold shadow-sm">
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
