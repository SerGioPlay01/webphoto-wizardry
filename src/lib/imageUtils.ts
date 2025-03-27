
// Helper utility functions for image manipulation

// Create a canvas element with the image drawn on it
export const createCanvas = (image: HTMLImageElement, width: number, height: number): HTMLCanvasElement => {
  const canvas = document.createElement('canvas');
  canvas.width = width;
  canvas.height = height;
  const ctx = canvas.getContext('2d');
  if (ctx) {
    ctx.drawImage(image, 0, 0, width, height);
  }
  return canvas;
};

// Apply filter string to canvas context
export const applyFilter = (canvas: HTMLCanvasElement, filterString: string): void => {
  const ctx = canvas.getContext('2d');
  if (!ctx) return;
  
  // Parse CSS filter string into canvas filter
  ctx.filter = filterString;
  const tempCanvas = document.createElement('canvas');
  tempCanvas.width = canvas.width;
  tempCanvas.height = canvas.height;
  const tempCtx = tempCanvas.getContext('2d');
  
  if (tempCtx) {
    tempCtx.drawImage(canvas, 0, 0);
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    ctx.filter = 'none';
    ctx.drawImage(tempCanvas, 0, 0);
  }
};

// Convert CSS filter class to filter string
export const cssFilterToCanvasFilter = (filterClass: string): string => {
  // Map of tailwind filters to canvas filter functions
  const filterMap: Record<string, (value: string) => string> = {
    'grayscale': (val = '100%') => `grayscale(${val})`,
    'sepia': (val = '100%') => `sepia(${val})`,
    'brightness': (val = '100') => `brightness(${parseInt(val) / 100})`,
    'contrast': (val = '100') => `contrast(${parseInt(val) / 100})`,
    'saturate': (val = '100') => `saturate(${parseInt(val) / 100})`,
    'hue-rotate': (val = '0deg') => `hue-rotate(${val})`,
  };
  
  // Split the filterClass into individual filters
  const filters = filterClass.split(' ').filter(f => f);
  
  if (filters.length === 0) return 'none';
  
  // Convert each filter
  const canvasFilters = filters.map(filter => {
    // Extract filter name and value (if any)
    const match = filter.match(/^([a-z-]+)(?:-(\d+|(?:\[\d+deg\])))?(?: .*)?$/);
    if (!match) return '';
    
    const [, name, value] = match;
    const filterFn = filterMap[name];
    
    if (!filterFn) return '';
    
    // Process special case for hue-rotate with [330deg]
    let processedValue = value;
    if (name === 'hue-rotate' && value?.includes('[') && value?.includes('deg]')) {
      processedValue = value.replace(/\[|\]/g, '');
    }
    
    return filterFn(processedValue);
  }).filter(f => f);
  
  return canvasFilters.join(' ') || 'none';
};

// Rotate the image
export const rotateImage = (
  canvas: HTMLCanvasElement, 
  degrees: number
): HTMLCanvasElement => {
  const tempCanvas = document.createElement('canvas');
  const tempCtx = tempCanvas.getContext('2d');
  const radians = degrees * Math.PI / 180;
  
  // Determine new dimensions for rotated canvas
  const originalWidth = canvas.width;
  const originalHeight = canvas.height;
  const newWidth = Math.abs(Math.cos(radians) * originalWidth) + Math.abs(Math.sin(radians) * originalHeight);
  const newHeight = Math.abs(Math.sin(radians) * originalWidth) + Math.abs(Math.cos(radians) * originalHeight);
  
  tempCanvas.width = newWidth;
  tempCanvas.height = newHeight;
  
  if (tempCtx) {
    // Translate and rotate
    tempCtx.translate(newWidth / 2, newHeight / 2);
    tempCtx.rotate(radians);
    tempCtx.drawImage(canvas, -originalWidth / 2, -originalHeight / 2);
  }
  
  return tempCanvas;
};

// Download canvas as image
export const downloadCanvasAsImage = (canvas: HTMLCanvasElement, fileName = 'edited-image.png'): void => {
  const link = document.createElement('a');
  link.download = fileName;
  link.href = canvas.toDataURL('image/png');
  link.click();
};

// Get CSS filter string based on adjustment values
export const getAdjustmentFilterStyle = (
  brightness: number,
  contrast: number,
  saturation: number
): string => {
  return `brightness(${brightness}%) contrast(${contrast}%) saturate(${saturation}%)`;
};

// Get filter class based on filter name
export const getFilterClass = (filterName: string): string => {
  const filter = filters.find(f => f.name === filterName);
  return filter ? filter.class : '';
};

// Available filters
export const filters = [
  { name: 'Normal', class: '' },
  { name: 'Grayscale', class: 'grayscale' },
  { name: 'Sepia', class: 'sepia' },
  { name: 'Vintage', class: 'sepia brightness-75 contrast-125' },
  { name: 'Cool', class: 'brightness-110 hue-rotate-30' },
  { name: 'Warm', class: 'brightness-105 hue-rotate-[330deg] saturate-150' },
  { name: 'Vivid', class: 'saturate-150 contrast-110' },
  { name: 'Dramatic', class: 'contrast-125 brightness-90' },
];
