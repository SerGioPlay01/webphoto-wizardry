
import React from 'react';
import { Button } from "@/components/ui/button";
import { ImageIcon, Download } from 'lucide-react';

interface NavbarProps {
  onUpload: () => void;
  onDownload: () => void;
  isImageLoaded: boolean;
}

const Navbar: React.FC<NavbarProps> = ({ onUpload, onDownload, isImageLoaded }) => {
  return (
    <header className="w-full px-6 py-4 glass-panel z-10 fixed top-0 left-0 right-0 animate-fade-in">
      <div className="max-w-7xl mx-auto flex items-center justify-between">
        <div className="flex items-center space-x-2">
          <ImageIcon className="h-6 w-6" />
          <h1 className="text-xl font-medium tracking-tight">PhotoWizard</h1>
        </div>
        
        <div className="flex items-center space-x-3">
          <Button
            onClick={onUpload}
            variant="outline"
            className="bg-white/90 border border-gray-200 shadow-sm hover:shadow-md transition-all duration-300 hover:bg-white"
          >
            <ImageIcon className="h-4 w-4 mr-2" />
            Upload Image
          </Button>
          
          <Button
            onClick={onDownload}
            disabled={!isImageLoaded}
            className="shadow-sm hover:shadow-md transition-all duration-300"
          >
            <Download className="h-4 w-4 mr-2" />
            Download
          </Button>
        </div>
      </div>
    </header>
  );
};

export default Navbar;
