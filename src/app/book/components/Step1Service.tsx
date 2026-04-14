'use client'

import { Service } from '@/lib/supabase/types'

interface Props {
  services: Service[]
  onSelect: (service: Service) => void
}

export default function Step1Service({ services, onSelect }: Props) {
  // Group by category
  const grouped = services.reduce<Record<string, Service[]>>((acc, s) => {
    if (!acc[s.category]) acc[s.category] = []
    acc[s.category].push(s)
    return acc
  }, {})

  return (
    <div className="max-w-2xl mx-auto">
      <h2 className="font-heading text-3xl sm:text-4xl text-brand-dark mb-2 text-center">
        Choose a Service
      </h2>
      <p className="text-gray-500 text-center mb-8">
        Select the care your pet needs.
      </p>

      {Object.entries(grouped).map(([category, items]) => (
        <div key={category} className="mb-8">
          <h3 className="text-sm font-semibold text-brand-dark uppercase tracking-wider mb-3">
            {category}
          </h3>
          <div className="grid gap-3">
            {items.map(service => (
              <button
                key={service.id}
                onClick={() => onSelect(service)}
                className="group bg-white border border-brand-border rounded-2xl p-5 text-left hover:border-brand-dark hover:shadow-lg hover:shadow-brand-dark/5 transition-all duration-200"
              >
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-brand-dark font-medium text-lg font-heading">
                      {service.name}
                    </p>
                    {service.description && (
                      <p className="text-gray-500 text-sm mt-1">{service.description}</p>
                    )}
                    <p className="text-gray-400 text-sm mt-1.5">
                      {service.duration_minutes} min
                    </p>
                  </div>
                  <div className="text-right flex-shrink-0 ml-4">
                    <p className="text-brand-dark font-heading text-xl font-semibold">
                      {service.price_cents === 0
                        ? 'Free'
                        : `$${(service.price_cents / 100).toFixed(0)}`}
                    </p>
                    <span className="text-brand-dark opacity-0 group-hover:opacity-100 transition text-sm">
                      Select →
                    </span>
                  </div>
                </div>
              </button>
            ))}
          </div>
        </div>
      ))}
    </div>
  )
}
