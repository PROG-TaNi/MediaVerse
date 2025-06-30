import React, { forwardRef } from 'react';

interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  label?: string;
  error?: string;
  fullWidth?: boolean;
}

const Input = forwardRef<HTMLInputElement, InputProps>(
  ({ label, error, className = '', fullWidth = true, ...props }, ref) => {
    return (
      <div className={`${fullWidth ? 'w-full' : ''} mb-4`}>
        {label && (
          <label
            className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1"
            htmlFor={props.id}
          >
            {label}
          </label>
        )}
        <input
          className={`
            w-full px-3 py-2 bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-700
            rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-indigo-500
            focus:border-indigo-500 text-sm ${error ? 'border-red-500' : ''}
            ${className}
          `}
          ref={ref}
          {...props}
        />
        {error && (
          <p className="mt-1 text-sm text-red-600 dark:text-red-400">{error}</p>
        )}
      </div>
    );
  }
);

Input.displayName = 'Input';

export default Input;