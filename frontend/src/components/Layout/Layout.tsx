import React from 'react';
import Footer from './Footer';
import Header from './Header';
import Sidebar from './Sidebar';

interface LayoutProps {
  children: React.ReactNode;
}

const Layout: React.FC<LayoutProps> = ({ children }) => (
  <div className="page-shell">
    <Header />
    <main className="mx-auto flex w-full max-w-7xl gap-6 px-4 py-6 sm:px-6 lg:px-8">
      <Sidebar />
      <div className="min-w-0 flex-1">{children}</div>
    </main>
    <Footer />
  </div>
);

export default Layout;
