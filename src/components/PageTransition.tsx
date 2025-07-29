import { motion, AnimatePresence } from 'framer-motion';
import type { ReactNode } from 'react';

interface PageTransitionProps {
  children: ReactNode;
  locationKey: string;
}

const pageVariants = {
  initial: {
    clipPath: 'circle(0% at 50% 50%)',
    opacity: 1,
  },
  in: {
    clipPath: 'circle(75% at 50% 50%)',
    opacity: 1,
  },
  out: {
    clipPath: 'circle(0% at 50% 50%)',
    opacity: 1,
  },
};

const pageTransition: import('framer-motion').Transition = {
  type: 'tween',
  ease: 'easeInOut',
  duration: 0.7,
};

const PageTransition = ({ children, locationKey }: PageTransitionProps) => {
  return (
    <AnimatePresence mode="wait">
      <motion.div
        key={locationKey}
        initial="initial"
        animate="in"
        exit="out"
        variants={pageVariants}
        transition={pageTransition}
      >
        {children}
      </motion.div>
    </AnimatePresence>
  );
};

export default PageTransition;
