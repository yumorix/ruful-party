'use client';

import { Suspense } from 'react';
import Image from 'next/image';
import logo from './logo.png';

export default function MatchingAppLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="flex flex-col min-h-screen">
      {/* Header */}
      <header className="bg-white border-b border-gray-100 shadow-sm z-10 relative">
        <div className="absolute inset-0 bg-pattern-dots bg-dots-sm opacity-5"></div>
        <div className="flex items-center justify-center px-6 h-20 relative">
          <div className="absolute left-0 top-0 w-full h-1 bg-gradient-to-r from-secondary-light via-primary-light to-secondary-light opacity-70"></div>
          <div className="flex items-center">
            <Image src={logo} alt="Ruful Party Logo" width={150} height={40} className="mr-2" />
          </div>
        </div>
      </header>

      {/* Page content */}
      <main className="flex-1 overflow-auto p-6 bg-background-default">
        <div className="max-w-md mx-auto mt-4">
          <Suspense
            fallback={
              <div className="flex justify-center items-center h-40">
                <div className="relative">
                  <div className="animate-spin rounded-full h-12 w-12 border-2 border-primary-light opacity-30"></div>
                  <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-primary-main absolute top-0 left-0"></div>
                </div>
              </div>
            }
          >
            {children}
          </Suspense>
        </div>
      </main>

      {/* Footer */}
      <footer className="bg-white border-t border-gray-100 p-6 text-center text-sm text-gray-500 relative">
        <div className="absolute inset-0 bg-pattern-dots bg-dots-sm opacity-5"></div>
        <div className="relative">
          <div className="decorative-line w-24 mx-auto mb-3"></div>
          <p className="font-serif tracking-wide">© 2025 RufulParty</p>
        </div>
      </footer>
    </div>
  );
}
