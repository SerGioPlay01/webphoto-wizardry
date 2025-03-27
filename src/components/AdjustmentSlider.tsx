
import React from 'react';
import { Slider } from "@/components/ui/slider";

interface AdjustmentSliderProps {
  label: string;
  value: number;
  min: number;
  max: number;
  step: number;
  onChange: (value: number) => void;
}

const AdjustmentSlider: React.FC<AdjustmentSliderProps> = ({
  label,
  value,
  min,
  max,
  step,
  onChange
}) => {
  return (
    <div className="w-full mb-4 animate-slide-in">
      <div className="flex items-center justify-between mb-2">
        <label className="text-sm font-medium">{label}</label>
        <span className="text-xs text-muted-foreground">{value}</span>
      </div>
      <Slider
        value={[value]}
        min={min}
        max={max}
        step={step}
        className="w-full"
        onValueChange={(values) => onChange(values[0])}
      />
    </div>
  );
};

export default AdjustmentSlider;
