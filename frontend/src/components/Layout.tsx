import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import { Wallet, LayoutDashboard, FileText } from 'lucide-react';

interface LayoutProps {
  children: React.ReactNode;
}

const Layout: React.FC<LayoutProps> = ({ children }) => {
  const location = useLocation();

  const isActive = (path: string) => {
    return location.pathname === path;
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900">
      {/* Header - Accessibility: Added ARIA attributes */}
      <header
        className="bg-slate-900/50 backdrop-blur-sm border-b border-slate-700 sticky top-0 z-50"
        role="banner"
        aria-label="Main navigation"
      >
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            {/* Logo */}
            <div className="flex items-center space-x-2">
              <div
                className="w-8 h-8 bg-gradient-to-br from-emerald-400 to-cyan-400 rounded-lg flex items-center justify-center"
                aria-label="Aegis Treasury Logo"
              >
                <Wallet className="w-5 h-5 text-white" aria-hidden="true" />
              </div>
              <span className="text-xl font-bold text-white hidden sm:inline">Aegis Treasury</span>
            </div>

            {/* Navigation - Accessibility: Added aria-current */}
            <nav className="flex space-x-1" aria-label="Main navigation">
              <Link
                to="/"
                className={`flex items-center space-x-2 px-3 sm:px-4 py-2 rounded-lg transition-colors ${
                  isActive('/')
                    ? 'bg-emerald-500/20 text-emerald-400'
                    : 'text-slate-300 hover:bg-slate-700/50 focus:bg-slate-700/50 focus:outline-none'
                }`}
                aria-current={isActive('/') ? 'page' : undefined}
              >
                <LayoutDashboard className="w-4 h-4" aria-hidden="true" />
                <span className="hidden sm:inline">Dashboard</span>
                <span className="sr-only">Go to Dashboard</span>
              </Link>
              <Link
                to="/proposals"
                className={`flex items-center space-x-2 px-3 sm:px-4 py-2 rounded-lg transition-colors ${
                  isActive('/proposals')
                    ? 'bg-emerald-500/20 text-emerald-400'
                    : 'text-slate-300 hover:bg-slate-700/50 focus:bg-slate-700/50 focus:outline-none'
                }`}
                aria-current={isActive('/proposals') ? 'page' : undefined}
              >
                <FileText className="w-4 h-4" aria-hidden="true" />
                <span className="hidden sm:inline">Proposals</span>
                <span className="sr-only">Go to Proposals</span>
              </Link>
            </nav>
          </div>
        </div>
      </header>

      {/* Main Content - Accessibility: Added role and aria-label */}
      <main
        className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8"
        role="main"
        aria-label="Main content"
      >
        {children}
      </main>

      {/* Footer */}
      <footer
        className="border-t border-slate-700 mt-12 py-6"
        role="contentinfo"
      >
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex flex-col sm:flex-row items-center justify-between text-sm text-slate-400 gap-2 sm:gap-0">
            <p>© 2026 Aegis Treasury. All rights reserved.</p>
            <p>Phase 1 Core MVP - Demo</p>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default Layout;
