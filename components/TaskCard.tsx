
import React, { useState } from 'react';
import type { GeneratedTask } from '../types';
import { ChevronDownIcon } from './icons';

interface TaskCardProps {
  task: GeneratedTask;
}

const FEATURE_COLORS: { [key: string]: string } = {
  'default': 'bg-gray-600 text-gray-100',
  'frontend': 'bg-blue-600 text-blue-100',
  'backend': 'bg-green-600 text-green-100',
  'database': 'bg-purple-600 text-purple-100',
  'devops': 'bg-orange-600 text-orange-100',
};

const getFeatureColor = (feature: string) => {
  const lowerFeature = feature.toLowerCase();
  for (const key in FEATURE_COLORS) {
    if (lowerFeature.includes(key)) {
      return FEATURE_COLORS[key];
    }
  }
  return FEATURE_COLORS['default'];
};


const TaskCard: React.FC<TaskCardProps> = ({ task }) => {
  const [isExpanded, setIsExpanded] = useState(false);

  return (
    <div className="bg-gray-800/50 border border-gray-700 rounded-lg transition-all duration-300">
      <div className="p-4 cursor-pointer" onClick={() => setIsExpanded(!isExpanded)}>
        <div className="flex justify-between items-start">
            <div>
                <span className={`inline-block px-2 py-0.5 text-xs font-semibold rounded-full ${getFeatureColor(task.feature)}`}>
                    {task.feature}
                </span>
                <h3 className="mt-2 text-md font-semibold text-white">{task.task_title}</h3>
                <p className="text-sm text-gray-400">{task.task_description}</p>
            </div>
            <ChevronDownIcon className={`w-5 h-5 text-gray-400 transform transition-transform duration-300 ${isExpanded ? 'rotate-180' : ''}`} />
        </div>
      </div>
      
      <div className={`grid transition-all duration-300 ease-in-out ${
          isExpanded ? 'grid-rows-[1fr] opacity-100' : 'grid-rows-[0fr] opacity-0'
        }`}
      >
        <div className="overflow-hidden">
            <div className="border-t border-gray-700 p-4 space-y-3 text-sm">
                <div>
                    <h4 className="font-semibold text-gray-300">Requisitos Chave:</h4>
                    <ul className="list-disc list-inside mt-1 text-gray-400 space-y-1">
                        {task.key_requirements.map((req, i) => <li key={i}>{req}</li>)}
                    </ul>
                </div>
                 <div>
                    <h4 className="font-semibold text-gray-300">Dependências Externas:</h4>
                    <p className="text-gray-400">{task.external_dependencies}</p>
                </div>
                 <div>
                    <h4 className="font-semibold text-gray-300">Detalhes, Restrições e Pontos de Atenção:</h4>
                    <p className="text-gray-400">{task.known_gotchas}</p>
                </div>
            </div>
        </div>
      </div>
    </div>
  );
};

export default TaskCard;
