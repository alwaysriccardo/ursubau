import React, { useState } from 'react';
import { Globe } from 'lucide-react';
import { useLanguage } from '../LanguageContext';
import { Language } from '../translations';

const LanguageSelector: React.FC = () => {
  const [isOpen, setIsOpen] = useState(false);
  const { language, setLanguage } = useLanguage();

  const languages = [
    { code: 'de' as Language, name: 'Deutsch', flag: '🇩🇪' },
    { code: 'es' as Language, name: 'Español', flag: '🇪🇸' },
    { code: 'en' as Language, name: 'English', flag: '🇬🇧' }
  ];

  const changeLanguage = (langCode: Language) => {
    setLanguage(langCode);
    setIsOpen(false);
  };

  return (
    <div className="fixed top-20 right-6 md:top-24 md:right-8 z-50">
      
      {/* Language Options */}
      {isOpen && (
        <div className="absolute top-16 right-0 flex flex-col gap-2 animate-in fade-in slide-in-from-top-2 duration-300">
          {languages.map((lang) => (
            <button
              key={lang.code}
              onClick={() => changeLanguage(lang.code)}
              className={`group flex items-center gap-3 px-4 py-3 rounded-full shadow-lg transition-all duration-300 hover:scale-105 ${
                language === lang.code
                  ? 'bg-[#C9A961] text-white'
                  : 'bg-white text-swiss-dark hover:bg-[#E8DCC8]'
              }`}
            >
              <span className="text-2xl">{lang.flag}</span>
              <span className="font-medium text-sm whitespace-nowrap">{lang.name}</span>
            </button>
          ))}
        </div>
      )}

      {/* Main Toggle Button */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="group relative bg-[#C9A961] hover:bg-[#B8954F] text-white p-3 md:p-4 rounded-full shadow-lg transition-all duration-300 hover:scale-110"
        aria-label="Select Language"
      >
        <Globe size={20} className={`md:w-6 md:h-6 transition-transform duration-300 ${isOpen ? 'rotate-180' : ''}`} />
        
        {/* Current Language Badge */}
        <span className="absolute -top-1 -right-1 bg-white text-[#C9A961] text-xs font-bold px-1.5 py-0.5 rounded-full border-2 border-[#C9A961]">
          {language.toUpperCase()}
        </span>
      </button>
    </div>
  );
};

export default LanguageSelector;
