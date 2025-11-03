
import React, { useState, createContext, useContext, ReactNode } from 'react';
import { ChevronDownIcon } from './icons';

interface AccordionContextType {
  openItem: string | null;
  setOpenItem: (id: string | null) => void;
}

const AccordionContext = createContext<AccordionContextType | undefined>(undefined);

interface AccordionComposition {
  Item: React.FC<AccordionItemProps>;
}

const Accordion: React.FC<{ children: ReactNode }> & AccordionComposition = ({ children }) => {
  const [openItem, setOpenItem] = useState<string | null>(null);
  
  const toggleItem = (id: string) => {
    setOpenItem(prev => (prev === id ? null : id));
  };

  return (
    <AccordionContext.Provider value={{ openItem, setOpenItem: toggleItem }}>
      <div className="border-t border-gray-700">{children}</div>
    </AccordionContext.Provider>
  );
};

interface AccordionItemProps {
  title: string;
  children: React.ReactNode;
}

const AccordionItem: React.FC<AccordionItemProps> = ({ title, children }) => {
  const context = useContext(AccordionContext);
  if (!context) {
    throw new Error('Accordion.Item must be used within an Accordion');
  }
  const { openItem, setOpenItem } = context;
  const isOpen = openItem === title;

  return (
    <div className="border-b border-gray-700">
      <h3>
        <button
          type="button"
          className="flex justify-between items-center w-full p-5 font-medium text-left text-gray-300 hover:bg-gray-800/60 transition"
          onClick={() => setOpenItem(title)}
          aria-expanded={isOpen}
        >
          <span>{title}</span>
          <ChevronDownIcon
            className={`w-6 h-6 transform transition-transform duration-300 ${isOpen ? 'rotate-180' : ''}`}
          />
        </button>
      </h3>
      <div
        className={`grid transition-all duration-300 ease-in-out ${
          isOpen ? 'grid-rows-[1fr] opacity-100' : 'grid-rows-[0fr] opacity-0'
        }`}
      >
        <div className="overflow-hidden">
          <div className="p-5">{children}</div>
        </div>
      </div>
    </div>
  );
};

Accordion.Item = AccordionItem;

export default Accordion;
