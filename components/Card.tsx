
import React from 'react';

interface CardProps {
  title: string;
  description?: string;
  children: React.ReactNode;
}

const Card: React.FC<CardProps> = ({ title, description, children }) => {
  return (
    <div className="bg-gray-800/50 border border-gray-700 rounded-xl shadow-lg backdrop-blur-sm">
      <div className="p-6">
        <h2 className="text-xl font-semibold text-white">{title}</h2>
        {description && <p className="mt-1 text-sm text-gray-400">{description}</p>}
        <div className="mt-6">
          {children}
        </div>
      </div>
    </div>
  );
};

export default Card;
