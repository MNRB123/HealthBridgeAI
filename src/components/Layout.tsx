import React, { useState } from 'react';
import { Outlet } from 'react-router-dom';
import Header from './Header';
import Sidebar from './Sidebar';
import BackendBanner from './BackendBanner';

const Layout: React.FC = () => {
  const [sidebarOpen, setSidebarOpen] = useState(false);

  return (
    <div className="flex h-screen overflow-hidden bg-gray-50/80">
      {/* Sidebar */}
      <Sidebar isOpen={sidebarOpen} onClose={() => setSidebarOpen(false)} />

      {/* Main area */}
      <div className="flex flex-col flex-1 min-w-0 overflow-hidden">
        <BackendBanner />
        <Header
          onMenuToggle={() => setSidebarOpen((p) => !p)}
          isSidebarOpen={sidebarOpen}
        />

        <main className="flex-1 overflow-y-auto px-4 py-5 md:px-6 lg:px-8">
          <Outlet />

          <footer className="mt-10 pt-5 border-t border-gray-200 text-center">
            <p className="text-xs text-gray-400">
              HealthBridge AI — Demo Application &middot; Not for medical use &middot; All data is for demonstration purposes only
            </p>
          </footer>
        </main>
      </div>
    </div>
  );
};

export default Layout;
