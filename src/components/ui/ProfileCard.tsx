import React, { useState } from 'react';
import { ArrowUpRight, LucideIcon } from 'lucide-react';
import { cn } from '@/lib/utils';

interface SocialLink {
  id: string;
  icon: LucideIcon;
  label: string;
  href: string;
}

interface ActionButtonProps {
  text: string;
  href?: string;
  onClick?: () => void;
}

interface GlassmorphismProfileCardProps {
  avatarUrl: string;
  name: string;
  title: string;
  bio: string;
  socialLinks?: SocialLink[];
  actionButton?: ActionButtonProps;
  isVerified?: boolean;
  rating?: number;
  reviews?: number;
  serviceCount?: number;
}

const GlassmorphismProfileCard: React.FC<GlassmorphismProfileCardProps> = ({
  avatarUrl,
  name,
  title,
  bio,
  socialLinks = [],
  actionButton,
  isVerified = false,
  rating,
  reviews,
  serviceCount,
}) => {
  const [hoveredItem, setHoveredItem] = useState<string | null>(null);

  return (
    <div className="relative w-full">
      <div 
        className="relative flex flex-col items-center p-8 rounded-3xl border transition-all duration-500 ease-out backdrop-blur-lg bg-white/50 dark:bg-black/50 border-white/30 dark:border-white/20"
        style={{
          boxShadow: '0 8px 32px rgba(0, 0, 0, 0.1)',
        }}
      >
        <div className="w-24 h-24 mb-4 rounded-full p-1 border-2 border-white/40 dark:border-white/20 relative">
          <img 
            src={avatarUrl} 
            alt={`${name}'s Avatar`}
            className="w-full h-full rounded-full object-cover"
            onError={(e) => { 
              const target = e.target as HTMLImageElement;
              target.onerror = null; 
              target.src = `https://ui-avatars.com/api/?name=${encodeURIComponent(name.charAt(0))}&background=000000&color=ffffff&size=96`;
            }}
          />
          {isVerified && (
            <div className="absolute -bottom-1 -right-1 w-7 h-7 bg-black dark:bg-white rounded-full flex items-center justify-center border-2 border-white dark:border-black">
              <svg className="w-4 h-4 text-white dark:text-black" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
              </svg>
            </div>
          )}
        </div>

        <h2 className="text-2xl font-bold text-black dark:text-white">{name}</h2>
        <p className="mt-1 text-sm font-medium text-gray-600 dark:text-gray-400">{title}</p>
        
        {/* Rating and Service Count */}
        {(rating !== undefined && rating !== null) || (serviceCount !== undefined && serviceCount !== null) ? (
          <div className="flex items-center gap-4 mt-3">
            {rating !== undefined && rating !== null && (
              <div className="flex items-center gap-1">
                <svg className="w-4 h-4 text-yellow-400 fill-current" viewBox="0 0 20 20">
                  <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                </svg>
                <span className="text-sm font-semibold text-black dark:text-white">{rating.toFixed(1)}</span>
                {reviews !== undefined && reviews !== null && (
                  <span className="text-xs text-gray-500 dark:text-gray-400">({reviews})</span>
                )}
              </div>
            )}
            
            {serviceCount !== undefined && serviceCount !== null && (
              <div className="flex items-center gap-1 text-sm text-gray-600 dark:text-gray-300">
                <span className="font-semibold text-black dark:text-white">{serviceCount}</span>
                <span className="text-xs">Service{serviceCount !== 1 ? 's' : ''}</span>
              </div>
            )}
          </div>
        ) : null}
        
        <p className="mt-4 text-center text-sm leading-relaxed text-gray-600 dark:text-gray-300">{bio}</p>

        {socialLinks.length > 0 && (
          <>
            <div className="w-1/2 h-px my-6 rounded-full bg-white/40 dark:bg-white/20" />
            <div className="flex items-center justify-center gap-3">
              {socialLinks.map((item) => (
                <SocialButton 
                  key={item.id} 
                  item={item} 
                  setHoveredItem={setHoveredItem} 
                  hoveredItem={hoveredItem} 
                />
              ))}
            </div>
          </>
        )}

        {actionButton && <ActionButton action={actionButton} />}
      </div>
      
      <div className="absolute inset-0 rounded-3xl -z-10 transition-all duration-500 ease-out blur-2xl opacity-20 bg-gradient-to-r from-black/30 to-black/30 dark:from-white/20 dark:to-white/20" />
    </div>
  );
};

const SocialButton: React.FC<{
  item: SocialLink;
  setHoveredItem: (id: string | null) => void;
  hoveredItem: string | null;
}> = ({ item, setHoveredItem, hoveredItem }) => (
  <div className="relative">
    <a
      href={item.href}
      onClick={(e) => e.preventDefault()}
      className="relative flex items-center justify-center w-12 h-12 rounded-full transition-all duration-300 ease-out group overflow-hidden bg-white/50 dark:bg-black/30 hover:bg-white dark:hover:bg-black/50 border border-white/40 dark:border-white/20"
      onMouseEnter={() => setHoveredItem(item.id)}
      onMouseLeave={() => setHoveredItem(null)}
      aria-label={item.label}
    >
      <div className="relative z-10 flex items-center justify-center">
        <item.icon size={20} className="transition-all duration-200 ease-out text-black/70 dark:text-white/70 group-hover:text-black dark:group-hover:text-white" />
      </div>
    </a>
    <Tooltip item={item} hoveredItem={hoveredItem} />
  </div>
);

const ActionButton: React.FC<{ action: ActionButtonProps }> = ({ action }) => (
  <button
    onClick={action.onClick}
    className="flex items-center gap-2 px-6 py-3 mt-8 rounded-full font-semibold text-base backdrop-blur-sm transition-all duration-300 ease-out hover:scale-[1.03] active:scale-95 group bg-black dark:bg-white text-white dark:text-black border border-black/40 dark:border-white/40"
    style={{ boxShadow: '0 4px 20px rgba(0,0,0,0.15)' }}
  >
    <span>{action.text}</span>
    <ArrowUpRight size={16} className="transition-transform duration-300 ease-out group-hover:rotate-45" />
  </button>
);

const Tooltip: React.FC<{ item: SocialLink; hoveredItem: string | null }> = ({ item, hoveredItem }) => (
  <div 
    role="tooltip"
    className={cn(
      "absolute -top-12 left-1/2 -translate-x-1/2 z-50 px-3 py-1.5 rounded-lg backdrop-blur-md border text-xs font-medium whitespace-nowrap transition-all duration-300 ease-out pointer-events-none bg-white/70 dark:bg-black/70 text-black dark:text-white border-white/40 dark:border-white/20",
      hoveredItem === item.id ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-2'
    )}
    style={{ boxShadow: '0 4px 20px rgba(0,0,0,0.1)' }}
  >
    {item.label}
    <div className="absolute -bottom-1 left-1/2 -translate-x-1/2 w-2 h-2 rotate-45 bg-white/70 dark:bg-black/70 border-b border-r border-white/40 dark:border-white/20" />
  </div>
);

export default GlassmorphismProfileCard;
