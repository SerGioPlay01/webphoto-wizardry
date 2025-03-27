
import React, { useState, useRef, useEffect } from 'react';
import { toast } from 'sonner';
import { Input } from "@/components/ui/input";
import ToolPanel from './ToolPanel';
import { 
  downloadCanvasAsImage, 
  getAdjustmentFilterStyle, 
  getFilterClass,
  filters,
  rotateImage,
  createCanvas,
  removeBgFromCanvas
} from '@/lib/imageUtils';
import CropOverlay from './CropOverlay';
import ResizeDialog from './ResizeDialog';

const ImageEditor: React.FC = () => {
  const [imageSrc, setImageSrc] = useState<string | null>(null);
  const [originalImage, setOriginalImage] = useState<HTMLImageElement | null>(null);
  const [adjustments, setAdjustments] = useState({
    brightness: 100,
    contrast: 100,
    saturation: 100
  });
  const [selectedFilter, setSelectedFilter] = useState('Normal');
  const [rotation, setRotation] = useState(0);
  const [isCropping, setIsCropping] = useState(false);
  const [cropRect, setCropRect] = useState({ x: 0, y: 0, width: 0, height: 0 });
  const [isResizing, setIsResizing] = useState(false);
  const [dimensions, setDimensions] = useState({ width: 0, height: 0 });
  const [isRemovingBg, setIsRemovingBg] = useState(false);
  
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const imageContainerRef = useRef<HTMLDivElement>(null);
  
  // Handle file upload
  const handleFileUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;
    
    if (!file.type.startsWith('image/')) {
      toast.error('Please select an image file');
      return;
    }
    
    const reader = new FileReader();
    reader.onload = (e) => {
      const img = new Image();
      img.onload = () => {
        setOriginalImage(img);
        setImageSrc(e.target?.result as string);
        setDimensions({
          width: img.width,
          height: img.height
        });
        // Reset all adjustments
        setAdjustments({
          brightness: 100,
          contrast: 100,
          saturation: 100
        });
        setSelectedFilter('Normal');
        setRotation(0);
        setIsCropping(false);
        setCropRect({ x: 0, y: 0, width: 0, height: 0 });
        toast.success('Image loaded successfully');
        
        // Dispatch event to notify image is loaded
        document.dispatchEvent(new CustomEvent('image-loaded'));
      };
      img.src = e.target?.result as string;
    };
    reader.readAsDataURL(file);
  };

  // Trigger file input click
  const handleUploadClick = () => {
    fileInputRef.current?.click();
  };
  
  // Handle filter selection
  const handleFilterSelect = (filter: string) => {
    setSelectedFilter(filter);
    toast.success(`Applied ${filter} filter`);
  };
  
  // Handle adjustment changes
  const handleAdjustmentChange = (name: string, value: number) => {
    setAdjustments(prev => ({
      ...prev,
      [name]: value
    }));
  };
  
  // Handle rotation
  const handleRotate = (direction: 'left' | 'right') => {
    const degrees = direction === 'left' ? -90 : 90;
    setRotation(prev => (prev + degrees) % 360);
    toast.success(`Rotated image ${direction}`);
  };
  
  // Toggle crop mode
  const handleCropToggle = () => {
    if (isCropping) {
      // Apply crop
      applyCrop();
    } else {
      // Enter crop mode
      setIsCropping(true);
      if (canvasRef.current) {
        // Initialize crop rectangle to full image
        setCropRect({ 
          x: 0, 
          y: 0, 
          width: canvasRef.current.width, 
          height: canvasRef.current.height 
        });
      }
      toast.info('Crop mode enabled. Drag to select crop area.');
    }
  };

  // Apply crop to the image
  const applyCrop = () => {
    if (!canvasRef.current || !originalImage || !cropRect.width || !cropRect.height) {
      setIsCropping(false);
      return;
    }

    const canvas = canvasRef.current;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    // Create a temporary canvas with the cropped area
    const tempCanvas = document.createElement('canvas');
    tempCanvas.width = cropRect.width;
    tempCanvas.height = cropRect.height;
    const tempCtx = tempCanvas.getContext('2d');
    if (!tempCtx) return;

    // Draw only the cropped area
    tempCtx.drawImage(
      canvas, 
      cropRect.x, 
      cropRect.y, 
      cropRect.width, 
      cropRect.height,
      0, 
      0, 
      cropRect.width, 
      cropRect.height
    );

    // Create a new image from the cropped canvas
    const newImg = new Image();
    newImg.onload = () => {
      setOriginalImage(newImg);
      setDimensions({
        width: cropRect.width,
        height: cropRect.height
      });
      
      // Update canvas dimensions
      canvas.width = cropRect.width;
      canvas.height = cropRect.height;
      
      // Draw the new image
      ctx.drawImage(newImg, 0, 0);
      setIsCropping(false);
      toast.success('Image cropped successfully');
    };
    newImg.src = tempCanvas.toDataURL();
  };

  // Handle crop rectangle changes
  const handleCropChange = (rect: {x: number, y: number, width: number, height: number}) => {
    setCropRect(rect);
  };
  
  // Toggle resize dialog
  const handleResizeToggle = () => {
    setIsResizing(!isResizing);
  };

  // Apply resize
  const handleResize = (newWidth: number, newHeight: number) => {
    if (!originalImage) return;

    setDimensions({
      width: newWidth,
      height: newHeight
    });

    toast.success(`Image resized to ${newWidth}x${newHeight}`);
    setIsResizing(false);
  };

  // Handle remove background
  const handleRemoveBackground = async () => {
    if (!canvasRef.current || !originalImage) return;
    
    try {
      setIsRemovingBg(true);
      toast.info('Removing background. This may take a moment...');
      
      const resultCanvas = await removeBgFromCanvas(canvasRef.current);
      
      if (resultCanvas) {
        // Create a new image from the result
        const newImg = new Image();
        newImg.onload = () => {
          setOriginalImage(newImg);
          setIsRemovingBg(false);
          toast.success('Background removed successfully');
        };
        newImg.src = resultCanvas.toDataURL();
      }
    } catch (error) {
      console.error('Error removing background:', error);
      toast.error('Failed to remove background');
      setIsRemovingBg(false);
    }
  };
  
  // Reset all adjustments
  const handleReset = () => {
    setAdjustments({
      brightness: 100,
      contrast: 100,
      saturation: 100
    });
    setSelectedFilter('Normal');
    setRotation(0);
    setIsCropping(false);
    toast.success('Reset all adjustments');
  };
  
  // Handle download
  const handleDownload = () => {
    if (!canvasRef.current || !originalImage) return;
    
    const canvas = canvasRef.current;
    const ctx = canvas.getContext('2d');
    
    if (!ctx) return;
    
    // Create a new canvas for the final image
    const finalCanvas = document.createElement('canvas');
    finalCanvas.width = canvas.width;
    finalCanvas.height = canvas.height;
    const finalCtx = finalCanvas.getContext('2d');
    
    if (!finalCtx) return;
    
    // Draw the current canvas state to the final canvas
    finalCtx.drawImage(canvas, 0, 0);
    
    // Download the image
    downloadCanvasAsImage(finalCanvas);
    toast.success('Image downloaded successfully');
  };
  
  // Listen for download event from parent
  useEffect(() => {
    const handleDownloadEvent = () => {
      handleDownload();
    };
    
    document.addEventListener('download-image', handleDownloadEvent);
    
    return () => {
      document.removeEventListener('download-image', handleDownloadEvent);
    };
  }, []);
  
  // Initialize canvas when image is loaded
  useEffect(() => {
    if (!originalImage || !canvasRef.current) return;
    
    const canvas = canvasRef.current;
    const ctx = canvas.getContext('2d');
    
    if (!ctx) return;
    
    // Set canvas dimensions to match image or custom dimensions
    canvas.width = dimensions.width || originalImage.width;
    canvas.height = dimensions.height || originalImage.height;
    
    // Draw the image
    ctx.drawImage(originalImage, 0, 0, canvas.width, canvas.height);
  }, [originalImage, dimensions]);
  
  // Update canvas when adjustments or filter changes
  useEffect(() => {
    if (!originalImage || !canvasRef.current) return;
    
    const canvas = canvasRef.current;
    const ctx = canvas.getContext('2d');
    
    if (!ctx) return;
    
    // Clear canvas
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    
    // Get selected filter class
    const filterClass = getFilterClass(selectedFilter);
    
    // Create adjustment filter style
    const adjustmentStyle = getAdjustmentFilterStyle(
      adjustments.brightness,
      adjustments.contrast,
      adjustments.saturation
    );
    
    // Combine filters
    const combinedFilter = `${adjustmentStyle} ${filterClass}`;
    ctx.filter = combinedFilter === ' ' ? 'none' : combinedFilter;
    
    // Draw the image with rotation if needed
    if (rotation % 360 !== 0) {
      let rotatedCanvas = createCanvas(originalImage, canvas.width, canvas.height);
      rotatedCanvas = rotateImage(rotatedCanvas, rotation);
      
      // Center the rotated image
      const xOffset = (canvas.width - rotatedCanvas.width) / 2;
      const yOffset = (canvas.height - rotatedCanvas.height) / 2;
      
      ctx.drawImage(rotatedCanvas, xOffset, yOffset);
    } else {
      // Draw without rotation
      ctx.drawImage(originalImage, 0, 0, canvas.width, canvas.height);
    }
  }, [adjustments, selectedFilter, rotation, originalImage, dimensions]);
  
  return (
    <div className="w-full px-6 flex-1 flex flex-col items-center justify-center">
      <Input
        type="file"
        accept="image/*"
        ref={fileInputRef}
        onChange={handleFileUpload}
        className="hidden"
      />
      
      {!imageSrc ? (
        <div 
          onClick={handleUploadClick}
          className="
            w-full max-w-lg aspect-video glass-panel rounded-lg shadow-sm
            flex flex-col items-center justify-center cursor-pointer
            hover:shadow-md hover:bg-white/90 transition-all duration-300
            animate-fade-in
          "
        >
          <div className="rounded-full bg-primary/5 p-4 mb-4 animate-float">
            <svg 
              className="w-10 h-10 text-primary/60" 
              fill="none" 
              stroke="currentColor" 
              viewBox="0 0 24 24" 
              xmlns="http://www.w3.org/2000/svg"
            >
              <path 
                strokeLinecap="round" 
                strokeLinejoin="round" 
                strokeWidth="1.5" 
                d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z"
              />
            </svg>
          </div>
          <h3 className="text-lg font-medium mb-2">Upload an image to edit</h3>
          <p className="text-sm text-muted-foreground">Click or drag and drop</p>
        </div>
      ) : (
        <div className="w-full py-10 flex flex-col items-center">
          <div className="w-full flex flex-col md:flex-row items-start gap-6 justify-center">
            <div 
              ref={imageContainerRef}
              className="
                relative flex-1 glass-panel rounded-lg overflow-hidden 
                max-w-3xl shadow-sm animate-scale-in
              "
            >
              <canvas 
                ref={canvasRef} 
                className="max-w-full max-h-[70vh] object-contain mx-auto"
              />
              
              {isCropping && (
                <CropOverlay
                  canvas={canvasRef.current}
                  initialRect={cropRect}
                  onCropChange={handleCropChange}
                />
              )}
            </div>
            
            <ToolPanel
              imageSrc={imageSrc}
              adjustments={adjustments}
              selectedFilter={selectedFilter}
              onAdjustmentChange={handleAdjustmentChange}
              onFilterSelect={handleFilterSelect}
              onRotateLeft={() => handleRotate('left')}
              onRotateRight={() => handleRotate('right')}
              onCrop={handleCropToggle}
              isCropping={isCropping}
              onResize={handleResizeToggle}
              onRemoveBackground={handleRemoveBackground}
              isRemovingBg={isRemovingBg}
              onReset={handleReset}
            />
          </div>
        </div>
      )}
      
      {isResizing && (
        <ResizeDialog
          width={dimensions.width}
          height={dimensions.height}
          onResize={handleResize}
          onCancel={() => setIsResizing(false)}
          open={isResizing}
        />
      )}
    </div>
  );
};

export default ImageEditor;
