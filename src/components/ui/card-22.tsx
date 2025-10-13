import * as React from 'react';
import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ChevronLeft, ChevronRight, Star, ArrowRight, MapPin, User } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { cn } from '../../utils/utils';
import { Badge } from './badge';
import Button from '../Button';

// Interface for component props for type safety and reusability
interface PlaceCardProps {
  images: string[];
  tags: string[];
  rating: number;
  title: string;
  dateRange: string;
  hostType: string;
  description: string;
  pricePerNight: number;
  className?: string;
  serviceId?: string;
  reviewCount?: number;
}

export const PlaceCard = ({
  images,
  tags,
  rating,
  title,
  dateRange,
  hostType,
  description,
  pricePerNight,
  className,
  serviceId,
  reviewCount = 0,
}: PlaceCardProps) => {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [direction, setDirection] = useState(0);
  const navigate = useNavigate();

  // Debug logging
  console.log('PlaceCard render:', { title, rating, reviewCount });

  // Carousel image change handler
  const changeImage = (newDirection: number, e: React.MouseEvent) => {
    e.stopPropagation(); // Prevent card click when clicking carousel buttons
    setDirection(newDirection);
    setCurrentIndex((prevIndex) => {
      const nextIndex = prevIndex + newDirection;
      if (nextIndex < 0) return images.length - 1;
      if (nextIndex >= images.length) return 0;
      return nextIndex;
    });
  };

  // Handle card click
  const handleCardClick = () => {
    if (serviceId) {
      navigate(`/service/${serviceId}`);
    }
  };

  // Handle book button click
  const handleBookClick = (e: React.MouseEvent) => {
    e.stopPropagation(); // Prevent card click when clicking button
    if (serviceId) {
      navigate(`/service/${serviceId}`);
    }
  };

  // Animation variants for the carousel
  const carouselVariants = {
    enter: (direction: number) => ({
      x: direction > 0 ? '100%' : '-100%',
      opacity: 0,
    }),
    center: {
      zIndex: 1,
      x: 0,
      opacity: 1,
    },
    exit: (direction: number) => ({
      zIndex: 0,
      x: direction < 0 ? '100%' : '-100%',
      opacity: 0,
    }),
  };

  // Animation variants for staggering content
  const contentVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: {
      opacity: 1,
      y: 0,
      transition: {
        staggerChildren: 0.1,
      },
    },
  };

  const itemVariants = {
    hidden: { opacity: 0, y: 15 },
    visible: { opacity: 1, y: 0 },
  };

  return (
    <motion.div
      initial="hidden"
      whileInView="visible"
      viewport={{ once: true, amount: 0.3 }}
      transition={{ duration: 0.5 }}
      variants={contentVariants}
      whileHover={{ 
        scale: 1.03, 
        boxShadow: '0px 25px 50px -12px rgba(0,0,0,0.25), 0px 10px 40px -5px rgba(0,0,0,0.15)',
        transition: { type: 'spring', stiffness: 300, damping: 20 }
      }}
      onClick={handleCardClick}
      className={cn(
        'w-full overflow-hidden rounded-2xl border border-white/30 dark:border-white/20 bg-gradient-to-br from-white/80 via-white/60 to-white/40 dark:from-black/40 dark:via-black/20 dark:to-black/10 backdrop-blur-xl text-black dark:text-white shadow-[0_20px_40px_-12px_rgba(0,0,0,0.15),0_8px_32px_0_rgba(0,0,0,0.08)] cursor-pointer flex flex-col h-full relative before:absolute before:inset-0 before:rounded-2xl before:bg-gradient-to-br before:from-white/20 before:to-transparent before:pointer-events-none before:z-10',
        className
      )}
    >
      {/* Image Carousel Section */}
      <div className="relative group h-64 flex-shrink-0">
        <AnimatePresence initial={false} custom={direction}>
          <motion.img
            key={currentIndex}
            src={images[currentIndex]}
            alt={title}
            custom={direction}
            variants={carouselVariants}
            initial="enter"
            animate="center"
            exit="exit"
            transition={{
              x: { type: 'spring', stiffness: 300, damping: 30 },
              opacity: { duration: 0.2 },
            }}
            className="absolute h-full w-full object-cover"
          />
        </AnimatePresence>
        
        {/* Carousel Navigation */}
        <div className="absolute inset-0 flex items-center justify-between p-2 opacity-0 group-hover:opacity-100 transition-opacity">
          <Button variant="white" size="icon" className="rounded-full !bg-white/90 hover:!bg-white text-black h-10 w-10" onClick={(e) => changeImage(-1, e)}>
            <ChevronLeft className="h-5 w-5" />
          </Button>
          <Button variant="white" size="icon" className="rounded-full !bg-white/90 hover:!bg-white text-black h-10 w-10" onClick={(e) => changeImage(1, e)}>
            <ChevronRight className="h-5 w-5" />
          </Button>
        </div>

        {/* Top Badges and Rating */}
        <div className="absolute top-3 left-3 flex gap-2 z-20">
          {tags.map((tag) => (
            <div
              key={tag}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-semibold bg-gradient-to-r from-white/90 via-white/80 to-white/70 dark:from-black/60 dark:via-black/40 dark:to-black/20 backdrop-blur-lg border border-white/40 dark:border-white/30 shadow-lg text-black dark:text-white"
            >
              
              {tag}
            </div>
          ))}
        </div>
        

        {/* Pagination Dots */}
        <div className="absolute bottom-3 left-1/2 -translate-x-1/2 flex gap-1.5">
          {images.map((_, index) => (
            <button
              key={index}
              onClick={() => setCurrentIndex(index)}
              className={cn(
                'h-1.5 w-1.5 rounded-full transition-all',
                currentIndex === index ? 'w-4 bg-white' : 'bg-white/50'
              )}
              aria-label={`Go to image ${index + 1}`}
            />
          ))}
        </div>
      </div>

      {/* Content Section */}
      <motion.div variants={contentVariants} className="p-5 space-y-4 flex flex-col flex-grow relative z-10 bg-gradient-to-t from-white/60 via-white/40 to-transparent dark:from-black/30 dark:via-black/10 dark:to-transparent backdrop-blur-sm">
        <motion.div variants={itemVariants}>
          <h3 className="text-xl font-bold text-black dark:text-white line-clamp-2">{title}</h3>
        </motion.div>

        <motion.div variants={itemVariants} className="flex flex-col gap-2">
          <div className="flex items-center gap-2 text-sm text-gray-600 dark:text-gray-400">
            <MapPin className="h-4 w-4 text-black-500 dark:text-white-400 flex-shrink-0" />
            <span className="truncate">{dateRange}</span>
          </div>
          <div className="flex items-center gap-2 text-sm text-gray-600 dark:text-gray-400">
            <User className="h-4 w-4 text-black-500 dark:text-white-400 flex-shrink-0" />
            <span className="truncate">{hostType}</span>
          </div>
        </motion.div>

        <motion.p variants={itemVariants} className="text-sm text-gray-600 dark:text-gray-400 leading-relaxed line-clamp-3 flex-grow">
          {description}
        </motion.p>

        <motion.div variants={itemVariants} className="flex justify-between items-center pt-2 mt-auto">
          <div className="flex flex-col gap-1">
            <p className="font-semibold text-black dark:text-white">
              LKR {pricePerNight}{' '}
              <span className="text-sm font-normal text-gray-600 dark:text-gray-400"> terms applied</span>
            </p>
            {rating && rating > 0 ? (
              <div className="flex items-center gap-1.5 group/rating cursor-pointer hover:scale-105 transition-transform">
                <div className="flex items-center gap-0.5">
                  {[...Array(5)].map((_, i) => (
                    <Star 
                      key={i}
                      className={cn(
                        "h-3.5 w-3.5 transition-all",
                        i < Math.floor(rating) 
                          ? "text-white-400 fill-white-400" 
                          : i < rating 
                            ? "text-white-400 fill-white-400 opacity-50"
                            : "text-gray-300 dark:text-gray-600"
                      )} 
                    />
                  ))}
                </div>
                <span className="text-sm font-semibold text-black dark:text-white">
                  {rating.toFixed(1)}
                </span>
                {reviewCount > 0 && (
                  <span className="text-xs text-gray-500 dark:text-gray-400">
                    ({reviewCount} {reviewCount === 1 ? 'review' : 'reviews'})
                  </span>
                )}
              </div>
            ) : (
              <div className="flex items-center gap-1.5">
                <div className="flex items-center gap-0.5">
                  {[...Array(5)].map((_, i) => (
                    <Star 
                      key={i}
                      className="h-3.5 w-3.5 text-gray-300 dark:text-gray-600"
                    />
                  ))}
                </div>
                <span className="text-xs text-gray-500 dark:text-gray-400">
                  No reviews yet
                </span>
              </div>
            )}
          </div>
          <Button variant="white" className="group rounded-full bg-white/80 backdrop-blur-sm border border-white/30 hover:bg-white/90 hover:border-white/50 shadow-lg hover:shadow-xl transition-all duration-300" onClick={handleBookClick}>
            View Details
            <ArrowRight className="h-4 w-4 ml-2 transition-transform group-hover:translate-x-1" />
          </Button>
        </motion.div>
      </motion.div>
    </motion.div>
  );
};
