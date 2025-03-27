
import React from 'react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import AdjustmentSlider from './AdjustmentSlider';
import FilterPreview from './FilterPreview';
import { Button } from "@/components/ui/button";
import { RotateCw, RotateCcw, Crop, Undo } from 'lucide-react';

interface ToolPanelProps {
  imageSrc: string | null;
  adjustments: {
    brightness: number;
    contrast: number;
    saturation: number;
  };
  selectedFilter: string;
  onAdjustmentChange: (name: string, value: number) => void;
  onFilterSelect: (filter: string) => void;
  onRotateLeft: () => void;
  onRotateRight: () => void;
  onCrop: () => void;
  onReset: () => void;
}

const filters = [
  { name: 'Normal', class: '' },
  { name: 'Grayscale', class: 'grayscale' },
  { name: 'Sepia', class: 'sepia' },
  { name: 'Vintage', class: 'sepia brightness-75 contrast-125' },
  { name: 'Cool', class: 'brightness-110 hue-rotate-30' },
  { name: 'Warm', class: 'brightness-105 hue-rotate-[330deg] saturate-150' },
  { name: 'Vivid', class: 'saturate-150 contrast-110' },
  { name: 'Dramatic', class: 'contrast-125 brightness-90' },
];

const ToolPanel: React.FC<ToolPanelProps> = ({
  imageSrc,
  adjustments,
  selectedFilter,
  onAdjustmentChange,
  onFilterSelect,
  onRotateLeft,
  onRotateRight,
  onCrop,
  onReset
}) => {
  if (!imageSrc) return null;

  return (
    <div className="w-full max-w-xs glass-panel p-4 rounded-lg animate-scale-in">
      <div className="flex justify-between items-center mb-4">
        <h3 className="text-lg font-medium">Edit Image</h3>
        <Button 
          variant="ghost" 
          size="sm" 
          onClick={onReset}
          className="text-xs hover:bg-background/50"
        >
          <Undo className="h-3 w-3 mr-1" />
          Reset
        </Button>
      </div>
      
      <div className="flex space-x-2 mb-4">
        <Button 
          variant="outline" 
          size="sm" 
          className="flex-1 tool-button"
          onClick={onRotateLeft}
        >
          <RotateCcw className="h-4 w-4" />
        </Button>
        <Button 
          variant="outline" 
          size="sm" 
          className="flex-1 tool-button"
          onClick={onRotateRight}
        >
          <RotateCw className="h-4 w-4" />
        </Button>
        <Button 
          variant="outline" 
          size="sm" 
          className="flex-1 tool-button"
          onClick={onCrop}
        >
          <Crop className="h-4 w-4" />
        </Button>
      </div>
      
      <Tabs defaultValue="adjust" className="w-full">
        <TabsList className="w-full mb-4">
          <TabsTrigger value="adjust" className="flex-1">Adjust</TabsTrigger>
          <TabsTrigger value="filters" className="flex-1">Filters</TabsTrigger>
        </TabsList>
        
        <TabsContent value="adjust">
          <AdjustmentSlider
            label="Brightness"
            value={adjustments.brightness}
            min={0}
            max={200}
            step={1}
            onChange={(value) => onAdjustmentChange('brightness', value)}
          />
          <AdjustmentSlider
            label="Contrast"
            value={adjustments.contrast}
            min={0}
            max={200}
            step={1}
            onChange={(value) => onAdjustmentChange('contrast', value)}
          />
          <AdjustmentSlider
            label="Saturation"
            value={adjustments.saturation}
            min={0}
            max={200}
            step={1}
            onChange={(value) => onAdjustmentChange('saturation', value)}
          />
        </TabsContent>
        
        <TabsContent value="filters">
          <div className="grid grid-cols-4 gap-2">
            {filters.map((filter) => (
              <FilterPreview
                key={filter.name}
                name={filter.name}
                filterClass={filter.class}
                imageSrc={imageSrc}
                isSelected={selectedFilter === filter.name}
                onClick={() => onFilterSelect(filter.name)}
              />
            ))}
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default ToolPanel;
