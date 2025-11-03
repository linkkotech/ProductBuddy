
import React from 'react';
import type { TechStack } from '../types';

interface TechStackSelectorProps {
  stacks: TechStack[];
  selectedStackId: string;
  onSelect: (stack: TechStack) => void;
}

const TechStackSelector: React.FC<TechStackSelectorProps> = ({ stacks, selectedStackId, onSelect }) => {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
      {stacks.map((stack) => (
        <button
          key={stack.id}
          type="button"
          onClick={() => onSelect(stack)}
          className={`
            p-4 text-left rounded-lg border-2 transition-all duration-200
            ${selectedStackId === stack.id 
              ? 'bg-blue-600/20 border-blue-500 ring-2 ring-blue-500' 
              : 'bg-gray-900/50 border-gray-600 hover:border-gray-500'
            }
          `}
        >
          <p className="font-semibold text-white">{stack.name}</p>
          <p className="text-sm text-gray-400">{stack.description}</p>
        </button>
      ))}
    </div>
  );
};

export default TechStackSelector;
