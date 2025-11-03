
import React from 'react';
import { Loader2Icon } from './icons';

interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  isLoading?: boolean;
  fullWidth?: boolean;
}

const Button: React.FC<ButtonProps> = ({ children, isLoading, fullWidth, className, ...props }) => {
  return (
    <button
      className={`
        inline-flex items-center justify-center px-6 py-3 border border-transparent 
        text-base font-medium rounded-lg shadow-sm text-white bg-blue-600 
        hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 
        focus:ring-offset-gray-900 focus:ring-blue-500 transition-all duration-200
        disabled:bg-gray-500 disabled:cursor-not-allowed
        ${fullWidth ? 'w-full' : ''}
        ${className}
      `}
      disabled={isLoading}
      {...props}
    >
      {isLoading ? (
        <>
          <Loader2Icon className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" />
          Processando...
        </>
      ) : (
        children
      )}
    </button>
  );
};

export default Button;
