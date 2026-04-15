import type { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'Services & Pricing — Gabriela\'s Premier Pet Care',
  description: 'Drop-in visits, dog walking, and overnight pet sitting in Orlando, FL. See pricing and book today.',
}

export default function ServicesPage() {
  const services = [
    {
      name: 'Drop-in Visits',
      price: '30 min — $25  ·  60 min — $45',
      desc: 'In-home visits to feed, potty breaks, playtime, and care for your pets while you\'re away.',
      img: 'https://images.squarespace-cdn.com/content/v1/69b4c6f521311439992d2041/1773530335157-CI71YU0EVUBMLWDOUZBN/unsplash-image-4nnFk8lCsBI.jpg',
    },
    {
      name: 'Dog Walking',
      price: '$25',
      desc: 'Daily walks to keep your dog active, healthy, and full of companionship.',
      img: 'https://images.squarespace-cdn.com/content/v1/69b4c6f521311439992d2041/1773530225200-8US2E11D0TZREJEJTDJM/unsplash-image-aI3EBLvcyu4.jpg',
    },
    {
      name: 'Overnight Pet Sitting',
      price: '$75',
      desc: 'Stay overnight to ensure your pet feels safe and comfortable, with extra attention and care through the night for your peace of mind.',
      img: 'https://images.squarespace-cdn.com/content/v1/69b4c6f521311439992d2041/1773612219275-LT3NFMMF9T88700F28SY/unsplash-image-QPNUabsYMRY.jpg',
    },
  ]

  return (
    <div className="min-h-screen bg-brand-bg">
      {/* Header */}
      <header className="sticky top-0 z-50 bg-brand-bg border-b border-brand-border">
        <div className="max-w-[1240px] mx-auto px-8 py-[22px] flex items-center justify-between">
          <a href="/" className="font-heading text-[22px] text-brand-dark tracking-tight">
            Gabriela&apos;s Premier Pet Care
          </a>
          <nav className="hidden md:flex items-center gap-9 text-[16px]">
            <a href="/" className="text-brand-dark border-b-2 border-transparent hover:border-brand-dark pb-1 transition">Home</a>
            <a href="/about" className="text-brand-dark border-b-2 border-transparent hover:border-brand-dark pb-1 transition">About</a>
            <a href="/services" className="text-brand-dark border-b-2 border-brand-dark pb-1">Services</a>
            <a href="/book" className="text-brand-dark border-b-2 border-transparent hover:border-brand-dark pb-1 transition">Book Appointment</a>
            <a href="/contact" className="text-brand-dark border-b-2 border-transparent hover:border-brand-dark pb-1 transition">Contact</a>
          </nav>
          <a
            href="/book"
            className="px-7 py-3.5 bg-brand-dark text-white rounded-full text-[15px] hover:bg-[#2a2a2a] transition inline-block"
          >
            Book
          </a>
        </div>
      </header>

      {/* Page Header */}
      <section className="bg-brand-surface py-20 text-center">
        <div className="max-w-[1240px] mx-auto px-8">
          <h1 className="font-heading text-[clamp(2.4rem,5vw,4rem)] leading-[1.1] mb-4">Ready to Book Pet Care?</h1>
          <p className="max-w-[64ch] mx-auto text-[#444]">
            Your pets deserve safe, loving care while you&apos;re away. Contact me today to schedule pet sitting, dog walks, drop-in visits, or overnights. Serving the Orlando, Florida area. Prices vary depending on the service and number of pets — contact me for a custom quote.
          </p>
        </div>
      </section>

      {/* Service Cards */}
      <section className="py-24">
        <div className="max-w-[1240px] mx-auto px-8">
          <div className="grid md:grid-cols-3 gap-8">
            {services.map(s => (
              <div key={s.name}>
                <div className="aspect-[4/5] overflow-hidden rounded bg-[#ddd] mb-5">
                  <img src={s.img} alt={s.name} className="w-full h-full object-cover" />
                </div>
                <h3 className="font-heading text-[clamp(1.6rem,2.4vw,2.25rem)] mb-2">{s.name}</h3>
                <p className="font-heading text-[1.15rem] mb-3">{s.price}</p>
                <p className="text-[#444]">{s.desc}</p>
              </div>
            ))}
          </div>
          <div className="text-center mt-10">
            <a
              href="/book"
              className="px-7 py-3.5 bg-brand-dark text-white rounded-full text-[15px] hover:bg-[#2a2a2a] hover:-translate-y-px transition-all inline-block"
            >
              Book Now
            </a>
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="bg-brand-surface text-center py-[120px] px-6">
        <h2 className="font-heading text-[clamp(2rem,4vw,3.25rem)] leading-[1.1] mb-6">Contact Us</h2>
        <p className="max-w-[56ch] mx-auto text-[#333] mb-7">Interested in working together? Fill out some info and we&apos;ll be in touch shortly. We can&apos;t wait to hear from you!</p>
        <div className="flex items-center justify-center gap-4 flex-wrap">
          <a
            href="/contact"
            className="px-7 py-3.5 bg-brand-dark text-white rounded-full text-[15px] hover:bg-[#2a2a2a] hover:-translate-y-px transition-all inline-block"
          >
            Get in Touch
          </a>
          <a
            href="/book"
            className="px-7 py-3.5 border border-brand-dark text-brand-dark rounded-full text-[15px] hover:bg-brand-dark hover:text-white hover:-translate-y-px transition-all inline-block"
          >
            Book Appointment
          </a>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-brand-dark text-[#e8e6df] py-[72px]">
        <div className="max-w-[1240px] mx-auto px-8">
          <div className="grid md:grid-cols-[2fr_1fr_1fr] gap-12 mb-12">
            <div>
              <h4 className="font-heading text-[1.1rem] mb-[18px]">Gabriela&apos;s Premier Pet Care</h4>
              <p className="max-w-[44ch] text-[#c9c6be]">Trusted dog sitting, dog walking, and overnight care. Serving the Orlando, FL area.</p>
            </div>
            <div>
              <h4 className="font-heading text-[1.1rem] mb-[18px]">Navigate</h4>
              <ul className="space-y-2.5">
                <li><a href="/" className="text-[#c9c6be] hover:text-white transition">Home</a></li>
                <li><a href="/about" className="text-[#c9c6be] hover:text-white transition">About</a></li>
                <li><a href="/services" className="text-[#c9c6be] hover:text-white transition">Services</a></li>
                <li><a href="/book" className="text-[#c9c6be] hover:text-white transition">Book Appointment</a></li>
                <li><a href="/contact" className="text-[#c9c6be] hover:text-white transition">Contact</a></li>
              </ul>
            </div>
            <div>
              <h4 className="font-heading text-[1.1rem] mb-[18px]">Contact</h4>
              <ul className="space-y-2.5">
                <li><a href="mailto:gabrielaspremierpetcare@gmail.com" className="text-[#c9c6be] hover:text-white transition">gabrielaspremierpetcare@gmail.com</a></li>
                <li className="text-[#c9c6be]">Orlando, FL</li>
              </ul>
            </div>
          </div>
          <div className="border-t border-white/10 pt-6 flex justify-between flex-wrap gap-3 text-sm text-[#9a978f]">
            <span>© {new Date().getFullYear()} Gabriela&apos;s Premier Pet Care</span>
            <span>Built with care.</span>
          </div>
        </div>
      </footer>
    </div>
  )
}
