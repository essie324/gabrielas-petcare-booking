export default function Home() {
  return (
    <div className="min-h-screen bg-brand-bg">
      {/* Header */}
      <header className="py-6 border-b border-brand-border/50">
        <div className="max-w-6xl mx-auto px-4 flex items-center justify-between">
          <span className="font-heading text-2xl text-brand-dark font-semibold">
            Gabriela&apos;s Premier Pet Care
          </span>
          <nav className="hidden sm:flex items-center gap-8 text-sm text-brand-dark/70">
            <a href="/" className="hover:text-brand-dark transition">Home</a>
            <a href="/book" className="hover:text-brand-dark transition">Book</a>
          </nav>
          <a
            href="/book"
            className="px-5 py-2.5 bg-brand-dark text-white rounded-full text-sm font-medium hover:bg-brand-violet transition"
          >
            Book Now
          </a>
        </div>
      </header>

      {/* Hero */}
      <section className="relative overflow-hidden">
        <div className="max-w-6xl mx-auto px-4 py-24 sm:py-32 text-center">
          <h1 className="font-heading text-5xl sm:text-7xl text-brand-dark leading-tight mb-6">
            Loving Care When<br />You&apos;re Not There
          </h1>
          <p className="text-lg text-gray-500 max-w-xl mx-auto mb-10">
            Trusted dog sitting, dog walking, drop-in visits, and overnight pet care
            serving the Orlando, FL area.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <a
              href="/book"
              className="px-8 py-4 bg-brand-dark text-white rounded-full text-lg font-medium hover:bg-brand-violet transition shadow-lg shadow-brand-dark/10"
            >
              Book an Appointment
            </a>
            <a
              href="tel:+14076987386"
              className="px-8 py-4 border border-brand-border text-brand-dark rounded-full text-lg font-medium hover:bg-brand-surface transition"
            >
              Call (407) 698-7386
            </a>
          </div>
        </div>
      </section>

      {/* Services */}
      <section className="py-20 bg-brand-surface/50">
        <div className="max-w-5xl mx-auto px-4">
          <h2 className="font-heading text-4xl text-brand-dark text-center mb-12">Our Services</h2>
          <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {[
              { name: 'Drop-in Visits', price: 'From $25', desc: 'Feeding, potty breaks, playtime, and companionship.' },
              { name: 'Dog Walking', price: '$25', desc: 'Daily walks to keep your dog active and happy.' },
              { name: 'Overnight Care', price: '$75', desc: 'Overnight stay so your pet feels safe.' },
              { name: 'Meet & Greet', price: 'Free', desc: 'Free consultation to discuss your pet\'s needs.' },
            ].map(s => (
              <div key={s.name} className="bg-white border border-brand-border rounded-2xl p-6 hover:shadow-lg hover:shadow-brand-violet/5 transition">
                <h3 className="font-heading text-xl text-brand-dark font-semibold mb-1">{s.name}</h3>
                <p className="text-brand-violet font-heading text-lg mb-3">{s.price}</p>
                <p className="text-gray-500 text-sm">{s.desc}</p>
              </div>
            ))}
          </div>
          <div className="text-center mt-10">
            <a
              href="/book"
              className="px-8 py-3 bg-brand-dark text-white rounded-full font-medium hover:bg-brand-violet transition"
            >
              Book Now
            </a>
          </div>
        </div>
      </section>

      {/* Trust */}
      <section className="py-16">
        <div className="max-w-4xl mx-auto px-4">
          <div className="flex flex-wrap justify-center gap-8 sm:gap-16 text-center">
            {['Insured & Bonded', 'Background Checked', '5-Star Rated', 'Pet First Aid Certified'].map(t => (
              <div key={t} className="flex items-center gap-2">
                <span className="w-6 h-6 bg-brand-dark text-white rounded-full flex items-center justify-center text-xs">✓</span>
                <span className="text-brand-dark font-medium text-sm">{t}</span>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-brand-dark text-white/70 py-12">
        <div className="max-w-6xl mx-auto px-4 flex flex-col sm:flex-row justify-between gap-8">
          <div>
            <h4 className="font-heading text-xl text-white mb-2">Gabriela&apos;s Premier Pet Care</h4>
            <p className="text-sm max-w-xs">Trusted dog sitting, dog walking, and overnight care. Serving Orlando, FL.</p>
          </div>
          <div className="text-sm space-y-1">
            <p><a href="mailto:gabrielaspremierpetcare@gmail.com" className="hover:text-white transition">gabrielaspremierpetcare@gmail.com</a></p>
            <p><a href="tel:+14076987386" className="hover:text-white transition">(407) 698-7386</a></p>
            <p>Orlando, FL</p>
          </div>
        </div>
        <div className="max-w-6xl mx-auto px-4 mt-8 pt-6 border-t border-white/10 text-xs text-white/40">
          © {new Date().getFullYear()} Gabriela&apos;s Premier Pet Care. Built with care.
        </div>
      </footer>
    </div>
  )
}
