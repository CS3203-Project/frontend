import { useLocation } from 'react-router-dom';
import Navbar from './Navbar';
import type { ReactNode } from 'react';

interface LayoutProps {
  children: ReactNode;
}

const Layout = ({ children }: LayoutProps) => {
  const location = useLocation();
  
  // Routes that should not have navbar/footer
  const authRoutes = ['/signin', '/signup'];
  const isAuthRoute = authRoutes.includes(location.pathname);

  // Routes that should not have navbar but keep footer
  const adminRoutes = ['/admin', '/admin-dashboard'];
  const isAdminRoute = adminRoutes.some(route => location.pathname.startsWith(route));

  if (isAuthRoute) {
    // For auth pages, render without navbar/footer
    return <>{children}</>;
  }

  if (isAdminRoute) {
    // For admin pages, render without navbar but keep footer
    return (
      <div className="min-h-screen flex flex-col">
        <main className="flex-1">
          {children}
        </main>
        {/* <Footer /> */}
      </div>
    );
  }

  // For all other pages, render with navbar/footer
  return (
    <div className="min-h-screen flex flex-col">
      <Navbar />
      <main className="flex-1">
        {children}
      </main>
      {/* <Footer /> */}
    </div>
  );
};

export default Layout;
