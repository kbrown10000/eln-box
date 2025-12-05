import { FiAlertTriangle } from 'react-icons/fi';

interface ErrorStateProps {
  message: string;
  onRetry?: () => void;
}

const ErrorState: React.FC<ErrorStateProps> = ({ message, onRetry }) => {
  return (
    <div className="flex flex-col items-center justify-center py-12 text-center text-text-body">
      <FiAlertTriangle className="w-12 h-12 text-red-500 mb-4" />
      <p className="text-lg font-body font-semibold text-primary mb-2">Oops! Something went wrong.</p>
      <p className="text-sm text-text-body mb-4">{message}</p>
      {onRetry && (
        <button
          onClick={onRetry}
          className="bg-accent text-white font-body px-4 py-2 rounded-md shadow-sm hover:bg-opacity-90 transition-colors"
        >
          Try Again
        </button>
      )}
    </div>
  );
};

export default ErrorState;
