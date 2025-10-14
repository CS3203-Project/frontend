import { DottedSurface } from "@/components/ui/dotted-surface";
import { cn } from '@/lib/utils';

export default function DottedSurfaceDemo() {
  return (
    <div className="min-h-screen bg-white dark:bg-black relative overflow-hidden">
      <DottedSurface className="size-full" />
      <div className="absolute inset-0 flex items-center justify-center">
        <div
          aria-hidden="true"
          className={cn(
            'pointer-events-none absolute -top-10 left-1/2 size-full -translate-x-1/2 rounded-full',
            'bg-[radial-gradient(ellipse_at_center,rgba(0,0,0,0.1),transparent_50%)] dark:bg-[radial-gradient(ellipse_at_center,rgba(255,255,255,0.1),transparent_50%)]',
            'blur-[30px]',
          )}
        />
        <h1 className="font-mono text-4xl font-semibold text-black dark:text-white z-10">
          Dotted Surface
        </h1>
      </div>
    </div>
  );
}
