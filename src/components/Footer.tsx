
import React from 'react';

const Footer: React.FC = () => {
  return (
    <footer className="w-full px-6 py-3 text-center text-sm text-muted-foreground animate-fade-in">
      <p>© {new Date().getFullYear()} PhotoWizard. All rights reserved.</p>
    </footer>
  );
};

export default Footer;
