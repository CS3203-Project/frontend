import React, { createContext, useContext, useState } from 'react';
import type { ReactNode } from 'react';
import Loader from './Loader';

interface LoaderContextType {
  showLoader: (message?: string, variant?: 'primary' | 'success' | 'accent' | 'white') => void;
  hideLoader: () => void;
  isLoading: boolean;
  message?: string;
}

const LoaderContext = createContext<LoaderContextType | undefined>(undefined);

interface LoaderProviderProps {
  children: ReactNode;
}

export const LoaderProvider: React.FC<LoaderProviderProps> = ({ children }) => {
  const [isLoading, setIsLoading] = useState(false);
  const [message, setMessage] = useState<string | undefined>();
  const [variant, setVariant] = useState<'primary' | 'success' | 'accent' | 'white'>('primary');

  const showLoader = (msg?: string, loaderVariant: 'primary' | 'success' | 'accent' | 'white' = 'primary') => {
    setMessage(msg);
    setVariant(loaderVariant);
    setIsLoading(true);
  };

  const hideLoader = () => {
    setIsLoading(false);
    setMessage(undefined);
  };

  return (
    <LoaderContext.Provider value={{ showLoader, hideLoader, isLoading, message }}>
      {children}
      {isLoading && (
        <div className="loader-overlay">
          <div className="flex flex-col items-center space-y-4">
            <Loader size="lg" variant={variant} />
            {message && (
              <div className="text-white font-mono text-sm text-center max-w-xs">
                {message}
              </div>
            )}
          </div>
        </div>
      )}
    </LoaderContext.Provider>
  );
};

export const useLoader = () => {
  const context = useContext(LoaderContext);
  if (context === undefined) {
    throw new Error('useLoader must be used within a LoaderProvider');
  }
  return context;
};