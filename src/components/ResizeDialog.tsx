
import React, { useState, useEffect } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { Switch } from "@/components/ui/switch";

interface ResizeDialogProps {
  width: number;
  height: number;
  onResize: (width: number, height: number) => void;
  onCancel: () => void;
  open: boolean;
}

const ResizeDialog: React.FC<ResizeDialogProps> = ({
  width,
  height,
  onResize,
  onCancel,
  open
}) => {
  const [newWidth, setNewWidth] = useState(width);
  const [newHeight, setNewHeight] = useState(height);
  const [maintainAspect, setMaintainAspect] = useState(true);
  const [aspectRatio, setAspectRatio] = useState(width / height);

  // Update local state when props change
  useEffect(() => {
    setNewWidth(width);
    setNewHeight(height);
    setAspectRatio(width / height);
  }, [width, height]);

  // Handle width change
  const handleWidthChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = parseInt(e.target.value, 10) || 0;
    setNewWidth(value);
    
    if (maintainAspect && value > 0) {
      setNewHeight(Math.round(value / aspectRatio));
    }
  };

  // Handle height change
  const handleHeightChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = parseInt(e.target.value, 10) || 0;
    setNewHeight(value);
    
    if (maintainAspect && value > 0) {
      setNewWidth(Math.round(value * aspectRatio));
    }
  };

  // Toggle maintain aspect ratio
  const handleAspectToggle = () => {
    setMaintainAspect(!maintainAspect);
    // Reset aspect ratio when toggling on
    if (!maintainAspect) {
      setAspectRatio(newWidth / newHeight);
    }
  };

  // Apply resize
  const handleApply = () => {
    onResize(newWidth, newHeight);
  };

  return (
    <Dialog open={open} onOpenChange={(open) => !open && onCancel()}>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>Resize Image</DialogTitle>
        </DialogHeader>
        
        <div className="grid gap-4 py-4">
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="width">Width (px)</Label>
              <Input
                id="width"
                type="number"
                min="1"
                value={newWidth}
                onChange={handleWidthChange}
              />
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="height">Height (px)</Label>
              <Input
                id="height"
                type="number"
                min="1"
                value={newHeight}
                onChange={handleHeightChange}
              />
            </div>
          </div>
          
          <div className="flex items-center space-x-2">
            <Switch
              id="maintain-aspect"
              checked={maintainAspect}
              onCheckedChange={handleAspectToggle}
            />
            <Label htmlFor="maintain-aspect">Maintain aspect ratio</Label>
          </div>
        </div>
        
        <DialogFooter>
          <Button variant="outline" onClick={onCancel}>Cancel</Button>
          <Button onClick={handleApply}>Apply</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

export default ResizeDialog;
