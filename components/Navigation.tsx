import React, { useState, useEffect } from 'react';
import { Menu, X } from 'lucide-react';
import { useLanguage } from '../LanguageContext';

const Navigation: React.FC = () => {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const { t } = useLanguage();

  // Prevent body scroll when menu is open
  useEffect(() => {
    if (isMenuOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = 'unset';
    }
    return () => {
      document.body.style.overflow = 'unset';
    };
  }, [isMenuOpen]);

  const handleLinkClick = (e: React.MouseEvent<HTMLAnchorElement>, targetId: string) => {
    e.preventDefault();
    setIsMenuOpen(false);
    
    // Delay scroll to allow menu to close first (mobile)
    setTimeout(() => {
      if (targetId === 'contact') {
        // For contact/footer, scroll to the very bottom of the page
        window.scrollTo({
          top: document.documentElement.scrollHeight,
          behavior: 'smooth'
        });
      } else {
        const element = document.getElementById(targetId);
        if (element) {
          element.scrollIntoView({ behavior: 'smooth', block: 'start' });
        }
      }
    }, 300);
  };

  return (
    <>
      <nav className="fixed top-0 left-0 w-full p-6 md:p-8 flex justify-between items-center z-[60]">
        <div className={`font-display font-bold text-lg md:text-xl tracking-tighter ${!isMenuOpen ? 'text-[#D4C5B0]' : 'text-white'}`}>
          URSU BAU GMBH
        </div>
        
        <div className="hidden md:flex gap-10 text-xs uppercase tracking-[0.2em] font-medium text-white mix-blend-difference">
          <a href="#projects" className="hover:text-swiss-gold transition-colors" onClick={(e) => handleLinkClick(e, 'projects')}>{t('nav_projects')}</a>
          <a href="#services" className="hover:text-swiss-gold transition-colors" onClick={(e) => handleLinkClick(e, 'services')}>{t('nav_services')}</a>
          <a href="#contact" className="hover:text-swiss-gold transition-colors" onClick={(e) => handleLinkClick(e, 'contact')}>{t('nav_contact')}</a>
        </div>
        
        <button 
          className={`md:hidden relative transition-all duration-300 ${!isMenuOpen ? 'text-[#D4C5B0]' : 'text-white'}`}
          onClick={() => setIsMenuOpen(!isMenuOpen)}
          aria-label="Toggle menu"
        >
          {isMenuOpen ? <X size={32} strokeWidth={2.5} /> : <Menu size={28} />}
        </button>
      </nav>

      {/* Mobile Menu Overlay */}
      <div 
        className={`fixed inset-0 bg-swiss-dark z-[55] md:hidden transition-transform duration-500 ease-in-out ${
          isMenuOpen ? 'translate-x-0' : 'translate-x-full'
        }`}
      >
        <div className="flex flex-col items-center justify-center h-full gap-12 text-swiss-cream">
          <a 
            href="#projects" 
            className="font-display text-4xl hover:text-swiss-gold transition-colors tracking-tight"
            onClick={(e) => handleLinkClick(e, 'projects')}
          >
            {t('nav_projects')}
          </a>
          <a 
            href="#services" 
            className="font-display text-4xl hover:text-swiss-gold transition-colors tracking-tight"
            onClick={(e) => handleLinkClick(e, 'services')}
          >
            {t('nav_services')}
          </a>
          <a 
            href="#contact" 
            className="font-display text-4xl hover:text-swiss-gold transition-colors tracking-tight"
            onClick={(e) => handleLinkClick(e, 'contact')}
          >
            {t('nav_contact')}
          </a>
          
          {/* Decorative Element */}
          <div className="absolute bottom-20 text-center">
            <p className="font-serif text-sm italic text-swiss-stone">Ursu Bau GmbH</p>
            <p className="text-xs text-swiss-stone/50 mt-2 tracking-wider">{t('nav_tagline')}</p>
          </div>
        </div>
      </div>
    </>
  );
};

export default Navigation;