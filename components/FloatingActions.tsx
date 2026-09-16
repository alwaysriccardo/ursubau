import React from 'react';
import { Phone, Mail } from 'lucide-react';
import { CONTACT_INFO } from '../constants';

const FloatingActions: React.FC = () => {
  return (
    <div className="fixed bottom-6 right-6 md:bottom-8 md:right-8 z-[100] flex flex-col gap-3 md:gap-4">
      {/* TikTok Button */}
      <a
        href={CONTACT_INFO.tiktok}
        target="_blank"
        rel="noopener noreferrer"
        className="group floating-btn bg-black hover:bg-[#1a1a1a] text-white w-14 h-14 rounded-full flex items-center justify-center shadow-lg hover:shadow-2xl transition-all duration-300 hover:scale-110 shine-effect"
        aria-label="TikTok"
      >
        <svg className="w-6 h-6" viewBox="0 0 24 24" fill="currentColor">
          <path d="M19.59 6.69a4.83 4.83 0 01-3.77-4.25V2h-3.45v13.67a2.89 2.89 0 01-5.2 1.74 2.89 2.89 0 012.31-4.64 2.93 2.93 0 01.88.13V9.4a6.84 6.84 0 00-1-.05A6.33 6.33 0 005.8 20.1a6.34 6.34 0 0010.86-4.43v-7a8.16 8.16 0 004.77 1.52v-3.4a4.85 4.85 0 01-1.84-.1z"/>
        </svg>
      </a>

      {/* Facebook Button */}
      <a
        href={CONTACT_INFO.facebook}
        target="_blank"
        rel="noopener noreferrer"
        className="group floating-btn bg-[#1877F2] hover:bg-[#0f63d6] text-white w-14 h-14 rounded-full flex items-center justify-center shadow-lg hover:shadow-2xl transition-all duration-300 hover:scale-110 shine-effect"
        aria-label="Facebook"
      >
        <svg className="w-6 h-6" viewBox="0 0 24 24" fill="currentColor">
          <path d="M24 12.073C24 5.405 18.627 0 12 0S0 5.405 0 12.073C0 18.1 4.388 23.094 10.125 24v-8.437H7.078v-3.49h3.047V9.413c0-3.026 1.792-4.697 4.533-4.697 1.312 0 2.686.236 2.686.236v2.971H15.83c-1.491 0-1.956.93-1.956 1.886v2.264h3.328l-.532 3.49h-2.796V24C19.612 23.094 24 18.1 24 12.073z"/>
        </svg>
      </a>

      {/* WhatsApp Button */}
      <a
        href={`https://wa.me/${CONTACT_INFO.whatsapp}`}
        target="_blank"
        rel="noopener noreferrer"
        className="group floating-btn bg-[#25D366] hover:bg-[#1fb855] text-white w-14 h-14 rounded-full flex items-center justify-center shadow-lg hover:shadow-2xl transition-all duration-300 hover:scale-110 shine-effect"
        aria-label="WhatsApp"
      >
        <svg className="w-7 h-7" viewBox="0 0 24 24" fill="currentColor">
          <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413Z"/>
        </svg>
      </a>

      {/* Email Button */}
      <a
        href={`mailto:${CONTACT_INFO.email}`}
        className="group floating-btn bg-swiss-gold hover:bg-[#b89448] text-white w-14 h-14 rounded-full flex items-center justify-center shadow-lg hover:shadow-2xl transition-all duration-300 hover:scale-110 shine-effect"
        aria-label="Email"
      >
        <Mail className="w-6 h-6" />
      </a>

      {/* Phone Button */}
      <a
        href={`tel:${CONTACT_INFO.phoneLink}`}
        className="group floating-btn bg-swiss-dark hover:bg-black text-swiss-cream w-14 h-14 rounded-full flex items-center justify-center shadow-lg hover:shadow-2xl transition-all duration-300 hover:scale-110 shine-effect"
        aria-label="Phone"
      >
        <Phone className="w-6 h-6" />
      </a>
    </div>
  );
};

export default FloatingActions;
