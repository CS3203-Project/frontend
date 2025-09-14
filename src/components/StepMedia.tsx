import { Check, ChevronLeft, ChevronRight, Loader } from 'lucide-react';

type VideoSources = { webm?: string; mp4?: string };

type Props = {
  currentStep: number;          // 1-based
  totalSteps: number;
  canProceed: boolean;
  isLoading: boolean;
  onPrev: () => void;
  onNext: () => void;
  onSubmit: () => void;

  // One video used for all steps
  video: VideoSources;
  poster?: string;

  // Step labels (optional but nice)
  stepTitles?: string[];
  stepSubtitles?: string[];
};

export default function StepMedia({
  currentStep,
  totalSteps,
  canProceed,
  isLoading,
  onPrev,
  onNext,
  onSubmit,
  video,
  poster,
  stepTitles = [],
  stepSubtitles = [],
}: Props) {
  const title = stepTitles[currentStep - 1] ?? '';
  const subtitle = stepSubtitles[currentStep - 1] ?? '';

  return (
    <div className="relative hidden lg:flex items-center justify-center bg-gradient-to-br from-gray-900 via-black to-gray-800 p-8 h-full">
      <div className="relative w-full max-w-lg h-full">
        <div className="relative h-full rounded-2xl overflow-hidden shadow-2xl bg-black/20 backdrop-blur-sm border border-white/10">
          {/* One video for all steps */}
          <video
            key="signup-steps-video"
            className="h-full w-full object-contain bg-black"
            autoPlay
            loop
            muted
            playsInline
            poster={poster}
          >
            {video.webm && <source src={video.webm} type="video/webm" />}
            {video.mp4 && <source src={video.mp4} type="video/mp4" />}
          </video>

          {/* Overlay gradient */}
          <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/10 to-transparent" />

          {/* Logo */}

          {/* Top-right step chip */}
          <div className="absolute top-6 left-6 text-right text-white/90">
            <div className="text-xs font-medium bg-white/10 px-2 py-1 rounded-full inline-block">
              Step {currentStep} of {totalSteps}
            </div>
          </div>

          {/* Bottom content: title, subtitle, progress dots, buttons */}
          <div className="absolute bottom-0 left-0 right-0 p-6 text-white">
            {title && <h3 className="text-xl font-bold mb-1 drop-shadow-lg">{title}</h3>}
            {subtitle && <p className="text-sm text-white/90 mb-4 drop-shadow">{subtitle}</p>}

            {/* Dots */}
            <div className="flex items-center gap-2 mb-4">
              {Array.from({ length: totalSteps }, (_, i) => {
                const active = i + 1 <= currentStep;
                return (
                  <span
                    key={i}
                    className={
                      active
                        ? 'h-1.5 w-8 rounded-full bg-white/90'
                        : 'h-1.5 w-1.5 rounded-full bg-white/50'
                    }
                  />
                );
              })}
            </div>

            {/* Nav buttons */}
            <div className="flex items-center justify-between">
              <button
                type="button"
                onClick={onPrev}
                disabled={currentStep === 1 || isLoading}
                className={`flex items-center text-sm px-4 py-2 rounded-xl font-medium transition-all duration-200
                  ${currentStep === 1 || isLoading
                    ? 'text-white/40 cursor-not-allowed'
                    : 'text-white hover:text-white hover:bg-white/10'
                  }`}
              >
                <ChevronLeft className="h-4 w-4 mr-1" />
                Back
              </button>

              {currentStep < totalSteps ? (
                <button
                  type="button"
                  onClick={onNext}
                  disabled={!canProceed || isLoading}
                  className={`group relative overflow-hidden flex items-center text-sm px-6 py-3 rounded-xl font-semibold transition-all duration-200
                    ${!canProceed || isLoading
                      ? 'bg-white/20 text-white/60 cursor-not-allowed'
                      : 'bg-gradient-to-r from-purple-600 to-blue-600 text-white hover:scale-[1.02] shadow-lg hover:shadow-purple-500/25'
                    }`}
                >
                  {!canProceed || isLoading ? (
                    <>
                      Next
                      <ChevronRight className="h-4 w-4 ml-1" />
                    </>
                  ) : (
                    <>
                      Next
                      <ChevronRight className="h-4 w-4 ml-1 group-hover:translate-x-1 transition-transform" />
                      <div className="absolute inset-0 rounded-xl bg-gradient-to-r from-purple-600 to-blue-600 opacity-0 group-hover:opacity-20 blur transition-opacity duration-300"></div>
                    </>
                  )}
                </button>
              ) : (
                <button
                  type="button"
                  onClick={onSubmit}
                  disabled={!canProceed || isLoading}
                  className={`group relative overflow-hidden flex items-center text-sm px-6 py-3 rounded-xl font-semibold transition-all duration-200
                    ${!canProceed || isLoading
                      ? 'bg-white/20 text-white/60 cursor-not-allowed'
                      : 'bg-gradient-to-r from-purple-600 to-blue-600 text-white hover:scale-[1.02] shadow-lg hover:shadow-purple-500/25'
                    }`}
                >
                  {isLoading ? (
                    <>
                      <Loader className="h-4 w-4 mr-2 animate-spin" />
                      Creating...
                    </>
                  ) : !canProceed ? (
                    <>
                      Create Account
                      <Check className="h-4 w-4 ml-1" />
                    </>
                  ) : (
                    <>
                      Create Account
                      <Check className="h-4 w-4 ml-1 group-hover:scale-110 transition-transform" />
                      <div className="absolute inset-0 rounded-xl bg-gradient-to-r from-purple-600 to-blue-600 opacity-0 group-hover:opacity-20 blur transition-opacity duration-300"></div>
                    </>
                  )}
                </button>
              )}
            </div>
          </div>
        </div>

        {/* Floating accents */}
        <div className="absolute -top-4 -right-4 w-20 h-20 rounded-full bg-gradient-to-r from-white/10 to-white/5 backdrop-blur-sm animate-pulse" />
        <div className="absolute -bottom-6 -left-6 w-16 h-16 rounded-full bg-gradient-to-r from-white/5 to-white/10 backdrop-blur-sm animate-pulse delay-1000" />
      </div>
    </div>
  );
}
