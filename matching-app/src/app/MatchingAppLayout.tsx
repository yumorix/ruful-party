'use client';

import { Suspense } from 'react';

export default function MatchingAppLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="flex flex-col min-h-screen">
      {/* Header */}
      <header className="bg-primary-main shadow-md z-10">
        <div className="flex items-center justify-center px-4 h-16">
          <h1 className="text-xl text-black">RufulParty</h1>
        </div>
      </header>

      {/* Page content */}
      <main className="flex-1 overflow-auto p-4 bg-background-default">
        <div className="max-w-md mx-auto mt-2">
          <Suspense
            fallback={
              <div className="flex justify-center items-center h-40">
                <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary-main"></div>
              </div>
            }
          >
            {children}
          </Suspense>
        </div>
      </main>

      {/* Footer */}
      <footer className="bg-white p-4 shadow-inner text-center text-sm text-gray-500">
        <p>© 2025 RufulParty</p>
      </footer>
    </div>
  );
}
