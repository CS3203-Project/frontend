import { useLocation } from 'react-router-dom';
import Navbar from './Navbar';
import Footer from './Footer';
import type { ReactNode } from 'react';

interface LayoutProps {
  children: ReactNode;
}

const Layout = ({ children }: LayoutProps) => {
  const location = useLocation();
  
  // Routes that should not have navbar/footer
  const authRoutes = ['/signin', '/signup'];
  const isAuthRoute = authRoutes.includes(location.pathname);

  if (isAuthRoute) {
    // For auth pages, render without navbar/footer
    return <>{children}</>;
  }

  // For all other pages, render with navbar/footer
  return (
    <div className="min-h-screen flex flex-col">
      <Navbar />
      <main className="flex-1">
        {children}
      </main>
      <Footer />
    </div>
  );
};

export default Layout;
