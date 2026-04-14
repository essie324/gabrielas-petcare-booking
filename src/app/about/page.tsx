import type { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'About — Gabriela\'s Premier Pet Care',
  description: 'Meet Gabriela — a family-run pet sitting business serving Orlando, FL with loving, dependable care.',
}

export default function AboutPage() {
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
            <a href="/about" className="text-brand-dark border-b-2 border-brand-dark pb-1">About</a>
            <a href="/services" className="text-brand-dark border-b-2 border-transparent hover:border-brand-dark pb-1 transition">Services</a>
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
          <h1 className="font-heading text-[clamp(2.4rem,5vw,4rem)] leading-[1.1]">Who We Are</h1>
        </div>
      </section>

      {/* About Content */}
      <section className="py-24">
        <div className="max-w-[1240px] mx-auto px-8 grid md:grid-cols-2 gap-[72px] items-center">
          <div className="rounded-md overflow-hidden aspect-[4/5] bg-[#ddd]">
            <img
              src="https://images.squarespace-cdn.com/content/v1/69b4c6f521311439992d2041/20c0146e-8ec5-456b-9147-63c6979e5259/IMG_1853.jpeg"
              alt="Gabriela and her family with their pets"
              className="w-full h-full object-cover"
            />
          </div>
          <div>
            <p className="mb-4">We are a family business. My name is Gabriela, and I started my dog sitting business because of my deep love for animals. I understand how important it is to know your pet is in safe and caring hands while you&apos;re away, because I have my own pets that I love as my own children.</p>
            <p className="mb-4">I provide dependable, loving care for animals of all sizes and personalities. Whether it&apos;s a walk, playtime, feeding, or simply keeping them company, I focus on making your pet feel comfortable and happy.</p>
            <p className="mb-4">Pet parents trust me because I treat every animal as if they were my own.</p>
            <p className="font-semibold">My mission is to give your pets reliable, loving, and safe care.</p>
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="bg-brand-surface text-center py-[120px] px-6">
        <h2 className="font-heading text-[clamp(2rem,4vw,3.25rem)] leading-[1.1] mb-6">Interested in working together?</h2>
        <p className="max-w-[56ch] mx-auto text-[#333] mb-7">Fill out some info and we&apos;ll be in touch shortly. We can&apos;t wait to hear from you!</p>
        <div className="flex items-center justify-center gap-4 flex-wrap">
          <a
            href="/contact"
            className="px-7 py-3.5 bg-brand-dark text-white rounded-full text-[15px] hover:bg-[#2a2a2a] hover:-translate-y-px transition-all inline-block"
          >
            Contact Us
          </a>
          <a
            href="/services"
            className="px-7 py-3.5 border border-brand-dark text-brand-dark rounded-full text-[15px] hover:bg-brand-dark hover:text-white hover:-translate-y-px transition-all inline-block"
          >
            See Services
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
                <li><a href="tel:+14076987386" className="text-[#c9c6be] hover:text-white transition">(407) 698-7386</a></li>
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
