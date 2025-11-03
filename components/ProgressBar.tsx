
import React from 'react';

interface ProgressBarProps {
  currentStep: number;
  steps: string[];
}

const ProgressBar: React.FC<ProgressBarProps> = ({ currentStep, steps }) => {
  return (
    <nav aria-label="Progress">
      <ol role="list" className="space-y-4 md:flex md:space-x-8 md:space-y-0 mb-10">
        {steps.map((stepName, index) => {
          const stepNumber = index + 1;
          const isCompleted = stepNumber < currentStep;
          const isCurrent = stepNumber === currentStep;

          return (
            <li key={stepName} className="md:flex-1">
              {isCompleted ? (
                <div className="group flex w-full flex-col border-l-4 border-blue-500 py-2 pl-4 transition-colors md:border-l-0 md:border-t-4 md:pb-0 md:pl-0 md:pt-4">
                  <span className="text-sm font-medium text-blue-500 transition-colors">{`Etapa ${stepNumber}`}</span>
                  <span className="text-sm font-medium text-white">{stepName}</span>
                </div>
              ) : isCurrent ? (
                <div
                  className="flex w-full flex-col border-l-4 border-blue-500 py-2 pl-4 md:border-l-0 md:border-t-4 md:pb-0 md:pl-0 md:pt-4"
                  aria-current="step"
                >
                  <span className="text-sm font-medium text-blue-500">{`Etapa ${stepNumber}`}</span>
                  <span className="text-sm font-medium text-white">{stepName}</span>
                </div>
              ) : (
                <div className="group flex w-full flex-col border-l-4 border-gray-600 py-2 pl-4 transition-colors md:border-l-0 md:border-t-4 md:pb-0 md:pl-0 md:pt-4">
                  <span className="text-sm font-medium text-gray-400 transition-colors">{`Etapa ${stepNumber}`}</span>
                  <span className="text-sm font-medium text-gray-300">{stepName}</span>
                </div>
              )}
            </li>
          );
        })}
      </ol>
    </nav>
  );
};

export default ProgressBar;
