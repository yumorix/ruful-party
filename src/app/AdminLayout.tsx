'use client';

import { useState } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';

const drawerWidth = 240;

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  const [mobileOpen, setMobileOpen] = useState(false);
  const pathname = usePathname();

  const handleDrawerToggle = () => {
    setMobileOpen(!mobileOpen);
  };

  const isActive = (path: string) => {
    return pathname.startsWith(path);
  };

  return (
    <div className="flex h-screen">
      {/* Mobile drawer backdrop */}
      {mobileOpen && (
        <div
          className="fixed inset-0 bg-black bg-opacity-50 z-20 md:hidden"
          onClick={handleDrawerToggle}
        ></div>
      )}

      {/* Sidebar / Drawer */}
      <aside
        className={`fixed md:static w-${drawerWidth}px bg-white border-r border-gray-200 h-full z-30 transition-transform duration-300 ${
          mobileOpen ? 'translate-x-0' : '-translate-x-full md:translate-x-0'
        }`}
      >
        <div className="p-4 border-b border-gray-200">
          <h1 className="text-xl">RufulParty</h1>
        </div>
        <nav className="p-2">
          <ul>
            <li>
              <Link
                href="/admin/parties"
                className={`flex items-center px-4 py-2 rounded-lg transition-colors ${
                  isActive('/admin/parties') ? 'bg-primary-main text-white' : 'hover:bg-gray-100'
                }`}
              >
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  className="h-5 w-5 mr-3"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M4 6h16M4 10h16M4 14h16M4 18h16"
                  />
                </svg>
                パーティ一覧
              </Link>
            </li>
          </ul>
        </nav>
      </aside>

      {/* Main content */}
      <div className="flex-1 flex flex-col min-w-0">
        {/* Header */}
        <header className="bg-primary-main shadow-md z-10">
          <div className="flex items-center px-4 h-16">
            <button
              className="md:hidden p-2 rounded-md hover:bg-primary-dark"
              onClick={handleDrawerToggle}
            >
              <svg
                xmlns="http://www.w3.org/2000/svg"
                className="h-6 w-6"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M4 6h16M4 12h16M4 18h16"
                />
              </svg>
            </button>
            <h1 className="ml-2 md:ml-0 text-xl ">管理画面</h1>
          </div>
        </header>

        {/* Page content */}
        <main className="flex-1 overflow-auto p-6 bg-background-default">
          <div className="max-w-7xl mx-auto mt-2">{children}</div>
        </main>
      </div>
    </div>
  );
}
