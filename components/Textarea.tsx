
import React from 'react';

interface TextareaProps extends React.TextareaHTMLAttributes<HTMLTextAreaElement> {
  label: string;
  hideLabel?: boolean;
}

const Textarea: React.FC<TextareaProps> = ({ label, name, hideLabel = false, ...props }) => {
  return (
    <div>
      {!hideLabel && (
        <label htmlFor={name} className="block text-sm font-medium text-gray-300 mb-2">
          {label}
        </label>
      )}
      <textarea
        id={name}
        name={name}
        className="block w-full bg-gray-900 border border-gray-600 rounded-md shadow-sm py-2 px-3 text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition"
        {...props}
      />
    </div>
  );
};

export default Textarea;
