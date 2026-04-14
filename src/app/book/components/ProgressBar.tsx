'use client'

const STEP_LABELS = [
  'Welcome',
  'Service',
  'Provider',
  'Date & Time',
  'Details',
  'Confirmed',
]

export default function ProgressBar({ currentStep }: { currentStep: number }) {
  return (
    <div className="w-full max-w-2xl mx-auto mb-10">
      <div className="flex items-center justify-between mb-2">
        {STEP_LABELS.map((label, i) => (
          <div key={label} className="flex flex-col items-center flex-1">
            <div
              className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-medium transition-all duration-300 ${
                i < currentStep
                  ? 'bg-brand-dark text-white'
                  : i === currentStep
                  ? 'bg-brand-dark text-white ring-4 ring-brand-dark/20'
                  : 'bg-brand-border text-brand-dark/40'
              }`}
            >
              {i < currentStep ? (
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M5 13l4 4L19 7" />
                </svg>
              ) : (
                i + 1
              )}
            </div>
            <span
              className={`text-xs mt-1.5 hidden sm:block transition-colors ${
                i <= currentStep ? 'text-brand-dark font-medium' : 'text-brand-dark/40'
              }`}
            >
              {label}
            </span>
          </div>
        ))}
      </div>
      <div className="h-1 bg-brand-border rounded-full overflow-hidden mt-2">
        <div
          className="h-full bg-brand-dark rounded-full transition-all duration-500 ease-out"
          style={{ width: `${(currentStep / (STEP_LABELS.length - 1)) * 100}%` }}
        />
      </div>
    </div>
  )
}
