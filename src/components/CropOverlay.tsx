
import React, { useState, useRef, useEffect } from 'react';

interface CropOverlayProps {
  canvas: HTMLCanvasElement | null;
  initialRect: { x: number; y: number; width: number; height: number };
  onCropChange: (rect: { x: number; y: number; width: number; height: number }) => void;
}

const CropOverlay: React.FC<CropOverlayProps> = ({ canvas, initialRect, onCropChange }) => {
  const [cropRect, setCropRect] = useState(initialRect);
  const [isDragging, setIsDragging] = useState(false);
  const [isResizing, setIsResizing] = useState<string | null>(null);
  const [startPos, setStartPos] = useState({ x: 0, y: 0 });
  const [originalRect, setOriginalRect] = useState({ ...initialRect });
  const overlayRef = useRef<HTMLDivElement>(null);

  // Handle the initial setup when canvas changes
  useEffect(() => {
    if (!canvas || !overlayRef.current) return;
    
    const canvasRect = canvas.getBoundingClientRect();
    
    // Set overlay dimensions to match canvas
    overlayRef.current.style.width = `${canvasRect.width}px`;
    overlayRef.current.style.height = `${canvasRect.height}px`;
    
    // Initialize crop rectangle if not already set
    if (initialRect.width === 0 || initialRect.height === 0) {
      const newRect = {
        x: 0,
        y: 0,
        width: canvas.width,
        height: canvas.height
      };
      setCropRect(newRect);
      onCropChange(newRect);
    }
  }, [canvas, initialRect]);

  // Start dragging the crop rectangle
  const handleMouseDown = (e: React.MouseEvent, type: string | null = null) => {
    e.preventDefault();
    
    if (!canvas || !overlayRef.current) return;
    
    const canvasRect = canvas.getBoundingClientRect();
    const overlayRect = overlayRef.current.getBoundingClientRect();
    
    // Calculate position relative to canvas
    const x = (e.clientX - overlayRect.left) * (canvas.width / canvasRect.width);
    const y = (e.clientY - overlayRect.top) * (canvas.height / canvasRect.height);
    
    setStartPos({ x, y });
    setOriginalRect({ ...cropRect });
    
    if (type) {
      setIsResizing(type);
    } else {
      setIsDragging(true);
    }
  };

  // Handle resize/drag movement
  const handleMouseMove = (e: React.MouseEvent) => {
    e.preventDefault();
    
    if (!canvas || !overlayRef.current || (!isDragging && !isResizing)) return;
    
    const canvasRect = canvas.getBoundingClientRect();
    const overlayRect = overlayRef.current.getBoundingClientRect();
    
    // Calculate position relative to canvas
    const x = (e.clientX - overlayRect.left) * (canvas.width / canvasRect.width);
    const y = (e.clientY - overlayRect.top) * (canvas.height / canvasRect.height);
    
    const deltaX = x - startPos.x;
    const deltaY = y - startPos.y;
    
    let newRect = { ...cropRect };
    
    if (isDragging) {
      // Move the entire crop rectangle
      newRect = {
        x: Math.max(0, Math.min(canvas.width - cropRect.width, originalRect.x + deltaX)),
        y: Math.max(0, Math.min(canvas.height - cropRect.height, originalRect.y + deltaY)),
        width: cropRect.width,
        height: cropRect.height
      };
    } else if (isResizing) {
      // Resize the crop rectangle based on the handle being dragged
      switch (isResizing) {
        case 'top-left':
          newRect = {
            x: Math.min(originalRect.x + deltaX, originalRect.x + originalRect.width - 20),
            y: Math.min(originalRect.y + deltaY, originalRect.y + originalRect.height - 20),
            width: Math.max(20, originalRect.width - deltaX),
            height: Math.max(20, originalRect.height - deltaY)
          };
          break;
        case 'top-right':
          newRect = {
            x: originalRect.x,
            y: Math.min(originalRect.y + deltaY, originalRect.y + originalRect.height - 20),
            width: Math.max(20, originalRect.width + deltaX),
            height: Math.max(20, originalRect.height - deltaY)
          };
          break;
        case 'bottom-left':
          newRect = {
            x: Math.min(originalRect.x + deltaX, originalRect.x + originalRect.width - 20),
            y: originalRect.y,
            width: Math.max(20, originalRect.width - deltaX),
            height: Math.max(20, originalRect.height + deltaY)
          };
          break;
        case 'bottom-right':
          newRect = {
            x: originalRect.x,
            y: originalRect.y,
            width: Math.max(20, originalRect.width + deltaX),
            height: Math.max(20, originalRect.height + deltaY)
          };
          break;
      }
      
      // Ensure crop rectangle stays within canvas bounds
      if (newRect.x < 0) {
        newRect.width += newRect.x;
        newRect.x = 0;
      }
      if (newRect.y < 0) {
        newRect.height += newRect.y;
        newRect.y = 0;
      }
      if (newRect.x + newRect.width > canvas.width) {
        newRect.width = canvas.width - newRect.x;
      }
      if (newRect.y + newRect.height > canvas.height) {
        newRect.height = canvas.height - newRect.y;
      }
    }
    
    setCropRect(newRect);
    onCropChange(newRect);
  };

  // End dragging or resizing
  const handleMouseUp = () => {
    setIsDragging(false);
    setIsResizing(null);
  };

  // Convert canvas coordinates to CSS pixels
  const canvasToCSS = (value: number, dimension: 'width' | 'height'): number => {
    if (!canvas || !overlayRef.current) return value;
    
    const canvasRect = canvas.getBoundingClientRect();
    return value * (dimension === 'width' ? canvasRect.width / canvas.width : canvasRect.height / canvas.height);
  };

  // Style for crop outline and handles
  const cropStyleCSS = {
    left: `${canvasToCSS(cropRect.x, 'width')}px`,
    top: `${canvasToCSS(cropRect.y, 'height')}px`,
    width: `${canvasToCSS(cropRect.width, 'width')}px`,
    height: `${canvasToCSS(cropRect.height, 'height')}px`,
  };

  return (
    <div 
      ref={overlayRef}
      className="absolute inset-0 cursor-move bg-black/50"
      onMouseMove={handleMouseMove}
      onMouseUp={handleMouseUp}
      onMouseLeave={handleMouseUp}
    >
      <div 
        className="absolute border-2 border-white"
        style={cropStyleCSS}
        onMouseDown={(e) => handleMouseDown(e)}
      >
        {/* Crop handles */}
        <div 
          className="absolute w-4 h-4 bg-white rounded-full -left-2 -top-2 cursor-nwse-resize"
          onMouseDown={(e) => handleMouseDown(e, 'top-left')}
        />
        <div 
          className="absolute w-4 h-4 bg-white rounded-full -right-2 -top-2 cursor-nesw-resize"
          onMouseDown={(e) => handleMouseDown(e, 'top-right')}
        />
        <div 
          className="absolute w-4 h-4 bg-white rounded-full -left-2 -bottom-2 cursor-nesw-resize"
          onMouseDown={(e) => handleMouseDown(e, 'bottom-left')}
        />
        <div 
          className="absolute w-4 h-4 bg-white rounded-full -right-2 -bottom-2 cursor-nwse-resize"
          onMouseDown={(e) => handleMouseDown(e, 'bottom-right')}
        />
      </div>
    </div>
  );
};

export default CropOverlay;
