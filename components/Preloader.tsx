import React, { useEffect, useState } from 'react';

interface PreloaderProps {
  onComplete: () => void;
}

const Preloader: React.FC<PreloaderProps> = ({ onComplete }) => {
  const [fadeOut, setFadeOut] = useState(false);

  useEffect(() => {
    // Show preloader for 2 seconds then fade out
    const timer = setTimeout(() => {
      setFadeOut(true);
      setTimeout(() => {
        onComplete();
      }, 500);
    }, 2000);

    return () => clearTimeout(timer);
  }, [onComplete]);

  return (
    <div 
      className={`fixed inset-0 z-[10000] bg-white flex justify-center items-center transition-opacity duration-500 ${
        fadeOut ? 'opacity-0' : 'opacity-100'
      }`}
    >
      {/* Logo */}
      <div className="animate-pulse">
        <img 
          src="/ursubaulogo.jpg" 
          alt="Ursu Bau GmbH"
          className="w-64 h-64 md:w-80 md:h-80 object-contain"
        />
      </div>
    </div>
  );
};

export default Preloader;
