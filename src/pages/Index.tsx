
import React, { useRef, useState } from 'react';
import Navbar from '@/components/Navbar';
import ImageEditor from '@/components/ImageEditor';
import Footer from '@/components/Footer';

const Index = () => {
  const [isImageLoaded, setIsImageLoaded] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const imageEditorRef = useRef<HTMLInputElement>(null);
  
  // Handle upload button click in navbar
  const handleUploadClick = () => {
    // Find the hidden file input in the ImageEditor component and click it
    const fileInput = document.querySelector('input[type="file"]');
    if (fileInput) {
      (fileInput as HTMLElement).click();
    }
  };
  
  // Handle download button click in navbar
  const handleDownloadClick = () => {
    // We'll use a custom event to trigger download in the ImageEditor
    const downloadEvent = new CustomEvent('download-image');
    document.dispatchEvent(downloadEvent);
  };
  
  // Listen for image load/unload to update navbar button state
  React.useEffect(() => {
    const handleImageLoaded = () => setIsImageLoaded(true);
    const handleImageUnloaded = () => setIsImageLoaded(false);
    
    document.addEventListener('image-loaded', handleImageLoaded);
    document.addEventListener('image-unloaded', handleImageUnloaded);
    
    return () => {
      document.removeEventListener('image-loaded', handleImageLoaded);
      document.removeEventListener('image-unloaded', handleImageUnloaded);
    };
  }, []);
  
  return (
    <div className="min-h-screen flex flex-col bg-gradient-to-b from-background to-background/90">
      <Navbar 
        onUpload={handleUploadClick} 
        onDownload={handleDownloadClick}
        isImageLoaded={isImageLoaded}
      />
      
      <main className="flex-1 pt-20 pb-10 flex flex-col">
        <ImageEditor />
      </main>
      
      <Footer />
    </div>
  );
};

export default Index;
