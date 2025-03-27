
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

// Remove background from canvas using simple color detection
export const removeBgFromCanvas = async (canvas: HTMLCanvasElement): Promise<HTMLCanvasElement | null> => {
  return new Promise((resolve) => {
    try {
      // Create a new canvas
      const resultCanvas = document.createElement('canvas');
      resultCanvas.width = canvas.width;
      resultCanvas.height = canvas.height;
      const resultCtx = resultCanvas.getContext('2d', { willReadFrequently: true });
      
      if (!resultCtx) {
        resolve(null);
        return;
      }
      
      // Get original image data
      const ctx = canvas.getContext('2d', { willReadFrequently: true });
      if (!ctx) {
        resolve(null);
        return;
      }
      
      const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height);
      const data = imageData.data;
      const resultImageData = resultCtx.createImageData(canvas.width, canvas.height);
      const resultData = resultImageData.data;
      
      // Simple edge detection and background removal algorithm
      // This is a simplified version - in a real app, consider using more advanced algorithms
      // or machine learning models for more accurate results
      
      // First pass - detect edges
      const edges = new Uint8Array(data.length / 4);
      const threshold = 20; // Adjust threshold as needed
      
      for (let y = 1; y < canvas.height - 1; y++) {
        for (let x = 1; x < canvas.width - 1; x++) {
          const idx = (y * canvas.width + x) * 4;
          const topIdx = ((y - 1) * canvas.width + x) * 4;
          const bottomIdx = ((y + 1) * canvas.width + x) * 4;
          const leftIdx = (y * canvas.width + (x - 1)) * 4;
          const rightIdx = (y * canvas.width + (x + 1)) * 4;
          
          // Calculate color difference with neighbors
          const diffTop = Math.abs(data[idx] - data[topIdx]) + 
                          Math.abs(data[idx + 1] - data[topIdx + 1]) + 
                          Math.abs(data[idx + 2] - data[topIdx + 2]);
                          
          const diffBottom = Math.abs(data[idx] - data[bottomIdx]) + 
                             Math.abs(data[idx + 1] - data[bottomIdx + 1]) + 
                             Math.abs(data[idx + 2] - data[bottomIdx + 2]);
                             
          const diffLeft = Math.abs(data[idx] - data[leftIdx]) + 
                           Math.abs(data[idx + 1] - data[leftIdx + 1]) + 
                           Math.abs(data[idx + 2] - data[leftIdx + 2]);
                           
          const diffRight = Math.abs(data[idx] - data[rightIdx]) + 
                            Math.abs(data[idx + 1] - data[rightIdx + 1]) + 
                            Math.abs(data[idx + 2] - data[rightIdx + 2]);
          
          // Mark as edge if difference is above threshold
          if (diffTop > threshold || diffBottom > threshold || 
              diffLeft > threshold || diffRight > threshold) {
            edges[y * canvas.width + x] = 255;
          }
        }
      }
      
      // Second pass - flood fill from edges to find foreground
      const queue: Array<[number, number]> = [];
      const visited = new Uint8Array(canvas.width * canvas.height);
      
      // Start from edges
      for (let y = 0; y < canvas.height; y++) {
        for (let x = 0; x < canvas.width; x++) {
          if (edges[y * canvas.width + x] > 0) {
            queue.push([x, y]);
            visited[y * canvas.width + x] = 1;
          }
        }
      }
      
      // Directions for flood fill (4-connected)
      const dx = [0, 1, 0, -1];
      const dy = [-1, 0, 1, 0];
      
      // Simple flood fill
      while (queue.length > 0) {
        const [x, y] = queue.shift()!;
        
        for (let i = 0; i < 4; i++) {
          const nx = x + dx[i];
          const ny = y + dy[i];
          
          if (nx >= 0 && nx < canvas.width && ny >= 0 && ny < canvas.height && 
              !visited[ny * canvas.width + nx]) {
            visited[ny * canvas.width + nx] = 1;
            queue.push([nx, ny]);
          }
        }
      }
      
      // Create result with transparent background
      for (let i = 0; i < data.length; i += 4) {
        const x = (i / 4) % canvas.width;
        const y = Math.floor((i / 4) / canvas.width);
        const pixelIndex = y * canvas.width + x;
        
        // Copy color channels
        resultData[i] = data[i];
        resultData[i + 1] = data[i + 1];
        resultData[i + 2] = data[i + 2];
        
        // Set alpha channel - transparent if not visited
        resultData[i + 3] = visited[pixelIndex] ? data[i + 3] : 0;
      }
      
      resultCtx.putImageData(resultImageData, 0, 0);
      resolve(resultCanvas);
    } catch (error) {
      console.error('Error removing background:', error);
      resolve(null);
    }
  });
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
