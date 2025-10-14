import { useState, useRef, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { Globe, Check, ChevronDown } from 'lucide-react';
import { cn } from '../utils/utils';

const LanguageSwitcher = () => {
  const { i18n, t } = useTranslation('common');
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  const languages = [
    { code: 'en', name: t('language.english', 'English'), flag: '🇺🇸' },
    { code: 'si', name: t('language.sinhala', 'සිංහල'), flag: '🇱🇰' },
    { code: 'ta', name: t('language.tamil', 'தமிழ்'), flag: '🇱🇰' },
  ];

  const currentLanguage = languages.find(lang => lang.code === i18n.language) || languages[0];

  const handleLanguageChange = (languageCode: string) => {
    i18n.changeLanguage(languageCode);
    setIsOpen(false);
  };

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  return (
    <div className="relative" ref={dropdownRef}>
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="flex items-center space-x-2 p-2 rounded-lg hover:bg-white/10 transition-all duration-300 group border border-transparent hover:border-white/20 relative overflow-hidden group"
      >
        {/* Button glitter effect */}
        <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/5 to-transparent transform -skew-x-12 group-hover:animate-pulse"></div>

        <Globe className="h-5 w-5 text-white/90 group-hover:text-white transition-colors duration-300" />
        <span className="text-white/90 group-hover:text-white transition-colors duration-300 text-sm font-medium">
          {currentLanguage.flag} {currentLanguage.name}
        </span>
        <ChevronDown className={cn(
          "h-4 w-4 text-white/70 group-hover:text-white transition-all duration-300",
          isOpen && "rotate-180"
        )} />
      </button>

      {/* Dropdown Menu */}
      {isOpen && (
        <div className="absolute top-full right-0 mt-2 w-48 bg-black/95 backdrop-blur-xl rounded-xl shadow-2xl border border-white/10 py-2 transition-all duration-300 origin-top-right z-50">
          {/* Glittering border effect */}
          <div className="absolute inset-0 rounded-xl bg-gradient-to-r from-white/5 via-white/10 to-white/5 animate-pulse"></div>

          <div className="px-4 py-2 border-b border-white/10 relative z-10">
            <p className="text-sm font-medium text-white">
              {t('language.selectLanguage', 'Select Language')}
            </p>
          </div>

          <div className="relative z-10">
            {languages.map((language) => (
              <button
                key={language.code}
                onClick={() => handleLanguageChange(language.code)}
                className={cn(
                  "w-full flex items-center justify-between px-4 py-3 text-sm transition-all duration-300 hover:bg-white/10 group",
                  i18n.language === language.code
                    ? "text-white bg-white/10"
                    : "text-white/90 hover:text-white"
                )}
              >
                <div className="flex items-center space-x-3">
                  <span className="text-base">{language.flag}</span>
                  <span>{language.name}</span>
                </div>
                {i18n.language === language.code && (
                  <Check className="h-4 w-4 text-green-400" />
                )}
              </button>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

export default LanguageSwitcher;
