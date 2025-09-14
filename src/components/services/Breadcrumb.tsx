import React from 'react';
import { ChevronRight, Home } from 'lucide-react';
import { Link } from 'react-router-dom';

interface BreadcrumbProps {
  items: {
    label: string;
    href?: string;
  }[];
}

const Breadcrumb: React.FC<BreadcrumbProps> = ({ items }) => {
  return (
    <nav className="flex" aria-label="Breadcrumb">
      <ol className="inline-flex items-center space-x-1 md:space-x-3">
        <li className="inline-flex items-center">
          <Link to="/" className="inline-flex items-center text-sm font-medium text-gray-300 hover:text-purple-400 transition-colors duration-200">
            <Home className="w-4 h-4 mr-2.5" />
            Home
          </Link>
        </li>
        {items.map((item, index) => (
          <li key={index}>
            <div className="flex items-center">
              <ChevronRight className="w-4 h-4 text-gray-500" />
              {item.href ? (
                <Link to={item.href} className="ml-1 text-sm font-medium text-gray-300 hover:text-purple-400 md:ml-2 transition-colors duration-200">
                  {item.label}
                </Link>
              ) : (
                <span className="ml-1 text-sm font-medium text-white md:ml-2">{item.label}</span>
              )}
            </div>
          </li>
        ))}
      </ol>
    </nav>
  );
};

export default Breadcrumb;
