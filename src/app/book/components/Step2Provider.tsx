'use client'

import { Provider } from '@/lib/supabase/types'

interface Props {
  providers: Provider[]
  isNewClient: boolean
  onSelect: (provider: Provider | null, bookWithAnyone: boolean) => void
}

export default function Step2Provider({ providers, isNewClient, onSelect }: Props) {
  const visible = providers.filter(p => p.booking_status !== 'closed')

  return (
    <div className="max-w-2xl mx-auto">
      <h2 className="font-heading text-3xl sm:text-4xl text-brand-dark mb-2 text-center">
        Choose Your Provider
      </h2>
      <p className="text-gray-500 text-center mb-8">
        Select who you&apos;d like to care for your pet.
      </p>

      <div className="grid gap-4">
        {/* Book with anyone option */}
        {visible.length > 1 && (
          <button
            onClick={() => onSelect(null, true)}
            className="group bg-white border border-brand-border rounded-2xl p-5 text-left hover:border-brand-violet hover:shadow-lg hover:shadow-brand-violet/5 transition-all duration-200"
          >
            <div className="flex items-center gap-4">
              <div className="w-14 h-14 rounded-full bg-brand-surface flex items-center justify-center flex-shrink-0">
                <span className="text-2xl">🐾</span>
              </div>
              <div>
                <p className="text-brand-dark font-medium text-lg font-heading">
                  Book with anyone available
                </p>
                <p className="text-gray-500 text-sm mt-0.5">
                  We&apos;ll match you with the next available provider.
                </p>
              </div>
            </div>
          </button>
        )}

        {visible.map(provider => {
          const isReferralOnly = provider.booking_status === 'referral_only' && isNewClient
          return (
            <button
              key={provider.id}
              onClick={() => !isReferralOnly && onSelect(provider, false)}
              disabled={isReferralOnly}
              className={`group bg-white border rounded-2xl p-5 text-left transition-all duration-200 ${
                isReferralOnly
                  ? 'border-brand-border/50 opacity-70 cursor-not-allowed'
                  : 'border-brand-border hover:border-brand-violet hover:shadow-lg hover:shadow-brand-violet/5'
              }`}
            >
              <div className="flex items-center gap-4">
                <div className="w-14 h-14 rounded-full bg-brand-surface overflow-hidden flex-shrink-0">
                  {provider.profile_photo_url ? (
                    <img
                      src={provider.profile_photo_url}
                      alt={provider.first_name}
                      className="w-full h-full object-cover"
                    />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center text-brand-violet text-xl font-heading font-bold">
                      {provider.first_name[0]}
                    </div>
                  )}
                </div>
                <div className="flex-1">
                  <div className="flex items-center gap-2">
                    <p className="text-brand-dark font-medium text-lg font-heading">
                      {provider.first_name} {provider.last_name}
                    </p>
                    {provider.booking_status === 'referral_only' && (
                      <span className="text-xs px-2 py-0.5 rounded-full bg-brand-gold/10 text-brand-gold border border-brand-gold/20 font-medium">
                        By referral
                      </span>
                    )}
                  </div>
                  {provider.bio && (
                    <p className="text-gray-500 text-sm mt-1 line-clamp-2">{provider.bio}</p>
                  )}
                  {provider.specialty_tags.length > 0 && (
                    <div className="flex flex-wrap gap-1.5 mt-2">
                      {provider.specialty_tags.map(tag => (
                        <span
                          key={tag}
                          className="text-xs px-2 py-0.5 rounded-full bg-brand-surface text-brand-violet"
                        >
                          {tag}
                        </span>
                      ))}
                    </div>
                  )}
                </div>
              </div>
            </button>
          )
        })}
      </div>
    </div>
  )
}
