export default function StepIndicator({
  currentStep,
  totalSteps,
  labels = [],
}) {
  return (
    <div className="flex items-center gap-3">
      {Array.from({ length: totalSteps }, (_, i) => {
        const step = i + 1;
        const isActive = step === currentStep;
        const isCompleted = step < currentStep;

        return (
          <div key={step} className="flex items-center gap-3">
            <div className="flex items-center gap-2">
              <div
                className={`
                  w-8 h-8 rounded-full flex items-center justify-center
                  text-sm font-semibold border transition-all duration-300
                  ${
                    isCompleted
                      ? "bg-success/20 border-success/50 text-success shadow-[0_0_12px_rgba(0,255,148,0.3)]"
                      : isActive
                        ? "bg-primary/20 border-primary/50 text-primary shadow-[0_0_12px_rgba(108,99,255,0.3)]"
                        : "bg-surface/40 border-white/10 text-txt-muted"
                  }
                `}
              >
                {isCompleted ? (
                  <svg
                    className="w-4 h-4"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                    strokeWidth={2.5}
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      d="M5 13l4 4L19 7"
                    />
                  </svg>
                ) : (
                  step
                )}
              </div>
              {labels[i] && (
                <span
                  className={`text-sm hidden sm:inline ${
                    isActive
                      ? "text-txt"
                      : isCompleted
                        ? "text-success/70"
                        : "text-txt-muted"
                  }`}
                >
                  {labels[i]}
                </span>
              )}
            </div>

            {step < totalSteps && (
              <div
                className={`w-8 h-px ${
                  isCompleted ? "bg-success/50" : "bg-white/10"
                }`}
              />
            )}
          </div>
        );
      })}
    </div>
  );
}
