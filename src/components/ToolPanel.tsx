
import React from 'react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import AdjustmentSlider from './AdjustmentSlider';
import FilterPreview from './FilterPreview';
import { Button } from "@/components/ui/button";
import { RotateCw, RotateCcw, Crop, Undo, ImageIcon, Eraser } from 'lucide-react';

interface ToolPanelProps {
  imageSrc: string | null;
  adjustments: {
    brightness: number;
    contrast: number;
    saturation: number;
  };
  selectedFilter: string;
  isCropping?: boolean;
  isRemovingBg?: boolean;
  onAdjustmentChange: (name: string, value: number) => void;
  onFilterSelect: (filter: string) => void;
  onRotateLeft: () => void;
  onRotateRight: () => void;
  onCrop: () => void;
  onResize: () => void;
  onRemoveBackground: () => void;
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
  isCropping = false,
  isRemovingBg = false,
  onAdjustmentChange,
  onFilterSelect,
  onRotateLeft,
  onRotateRight,
  onCrop,
  onResize,
  onRemoveBackground,
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
      
      <div className="grid grid-cols-3 gap-2 mb-4">
        <Button 
          variant="outline" 
          size="sm" 
          className="tool-button"
          onClick={onRotateLeft}
        >
          <RotateCcw className="h-4 w-4" />
        </Button>
        <Button 
          variant="outline" 
          size="sm" 
          className="tool-button"
          onClick={onRotateRight}
        >
          <RotateCw className="h-4 w-4" />
        </Button>
        <Button 
          variant={isCropping ? "default" : "outline"} 
          size="sm" 
          className="tool-button"
          onClick={onCrop}
        >
          <Crop className="h-4 w-4" />
        </Button>
      </div>
      
      <div className="grid grid-cols-2 gap-2 mb-4">
        <Button 
          variant="outline" 
          size="sm" 
          className="tool-button"
          onClick={onResize}
        >
          <ImageIcon className="h-4 w-4 mr-1" />
          Resize
        </Button>
        <Button 
          variant={isRemovingBg ? "default" : "outline"} 
          size="sm" 
          className="tool-button"
          onClick={onRemoveBackground}
          disabled={isRemovingBg}
        >
          <Eraser className="h-4 w-4 mr-1" />
          {isRemovingBg ? 'Processing...' : 'Remove BG'}
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
