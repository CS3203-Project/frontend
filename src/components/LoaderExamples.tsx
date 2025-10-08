// Example usage of the new Loader component in your platform

// 1. Import the Loader component
import Loader from './Loader';
import { useLoader } from './LoaderContext';

// 2. Usage examples for different scenarios:

// Basic inline loader
function LoadingButton() {
  return (
    <button className="flex items-center space-x-2">
      <Loader size="sm" variant="accent" />
      <span>Loading...</span>
    </button>
  );
}

// Messaging loading state (matches your green theme)
function MessagingLoader() {
  return (
    <div className="flex items-center justify-center py-8">
      <div className="flex flex-col items-center space-y-3">
        <Loader size="lg" variant="success" />
        <div className="text-green-400 font-mono text-sm">
          $ Establishing connection...
        </div>
      </div>
    </div>
  );
}

// Global loading overlay using context
function AsyncComponent() {
  const { showLoader, hideLoader } = useLoader();
  
  const handleAsyncOperation = async () => {
    showLoader('Loading messages...', 'success');
    try {
      // Your async operation here
      await new Promise(resolve => setTimeout(resolve, 2000));
    } finally {
      hideLoader();
    }
  };
  
  return (
    <button onClick={handleAsyncOperation}>
      Start Operation
    </button>
  );
}

// Terminal-style loading for your messaging components
function TerminalLoader() {
  return (
    <div className="text-center py-8">
      <div className="text-green-400 font-mono text-sm mb-4">
        $ Initializing connection...
      </div>
      <Loader size="md" variant="accent" className="loader-terminal" />
      <div className="animate-pulse text-green-400 font-mono text-xs mt-4">
        ████████████████████████████████
      </div>
    </div>
  );
}

// Confirmation panel loading
function ConfirmationLoader() {
  return (
    <div className="bg-white/10 backdrop-blur-sm p-4 rounded-xl border border-white/20">
      <div className="flex items-center justify-center space-x-3">
        <Loader size="sm" variant="success" className="loader-confirmation" />
        <span className="text-white font-mono text-sm">Saving...</span>
      </div>
    </div>
  );
}

export { 
  LoadingButton, 
  MessagingLoader, 
  TerminalLoader, 
  ConfirmationLoader,
  AsyncComponent
};