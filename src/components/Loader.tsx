import React from 'react';
import './Loader.css';

interface LoaderProps {
  size?: 'sm' | 'md' | 'lg' | 'xl';
  variant?: 'primary' | 'success' | 'accent' | 'white';
  className?: string;
}

const Loader: React.FC<LoaderProps> = ({ 
  size = 'md', 
  variant = 'primary', 
  className = '' 
}) => {
  const sizeClasses = {
    sm: 'loader-sm',
    md: 'loader-md', 
    lg: 'loader-lg',
    xl: 'loader-xl'
  };

  const variantClasses = {
    primary: 'loader-primary',
    success: 'loader-success', 
    accent: 'loader-accent',
    white: 'loader-white'
  };

  return (
    <div className={`loader ${sizeClasses[size]} ${variantClasses[variant]} ${className}`}>
    </div>
  );
};

export default Loader;