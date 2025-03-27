
import React from 'react';

interface FilterPreviewProps {
  name: string;
  filterClass: string;
  imageSrc: string;
  isSelected: boolean;
  onClick: () => void;
}

const FilterPreview: React.FC<FilterPreviewProps> = ({
  name,
  filterClass,
  imageSrc,
  isSelected,
  onClick
}) => {
  return (
    <div 
      className={`
        flex flex-col items-center transition-all duration-300
        ${isSelected ? 'scale-105' : 'opacity-80 hover:opacity-100'}
      `}
      onClick={onClick}
    >
      <div 
        className={`
          w-16 h-16 rounded-md overflow-hidden mb-1 cursor-pointer
          border-2 transition-all duration-200
          ${isSelected ? 'border-primary shadow-md' : 'border-transparent'}
        `}
      >
        <img 
          src={imageSrc} 
          alt={name}
          className={`w-full h-full object-cover ${filterClass}`}
        />
      </div>
      <span className="text-xs font-medium">{name}</span>
    </div>
  );
};

export default FilterPreview;
