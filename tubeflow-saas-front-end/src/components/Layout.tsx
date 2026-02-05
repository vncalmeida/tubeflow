import React from 'react';
import Sidebar from './Sidebar';
import FooterDashboard from './FooterDashboard';
import { useSidebar } from '../context/SidebarContext';

interface LayoutProps {
  children: React.ReactNode;
  sidebar?: React.ReactNode;
  showFooter?: boolean;
}

const Layout: React.FC<LayoutProps> = ({ children, sidebar, showFooter = true }) => {
  const { isSidebarOpen } = useSidebar();

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-black dark:text-white flex flex-col">
      {sidebar || <Sidebar />}
      <main className={`flex-1 transition-all duration-300 ease-in-out ${isSidebarOpen ? 'lg:ml-64' : 'lg:ml-16'}`}>
        <div className="p-6 min-h-[calc(106vh-64px)]">{children}</div>
      </main>
      {showFooter && <FooterDashboard />}
    </div>
  );
};

export default Layout;
