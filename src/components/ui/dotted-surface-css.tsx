import { cn } from '@/lib/utils';
import React from 'react';

type DottedSurfaceProps = Omit<React.ComponentProps<'div'>, 'ref'>;

export function DottedSurfaceCss({ className, ...props }: DottedSurfaceProps) {
  return (
    <div
      className={cn('pointer-events-none fixed inset-0', className)}
      style={{ zIndex: -10 }}
      {...props}
    >
      {/* Animated dotted grid pattern */}
      <div className="absolute inset-0 bg-[radial-gradient(circle,rgba(0,0,0,0.15)_1.5px,transparent_1.5px)] dark:bg-[radial-gradient(circle,rgba(255,255,255,0.15)_1.5px,transparent_1.5px)] bg-[size:50px_50px] animate-[wave_20s_ease-in-out_infinite]" />
      
      {/* Add wave animation */}
      <style>{`
        @keyframes wave {
          0%, 100% {
            background-position: 0px 0px, 25px 25px;
          }
          50% {
            background-position: 25px 25px, 0px 0px;
          }
        }
      `}</style>
    </div>
  );
}
