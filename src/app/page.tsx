export default function Home() {
  return (
    <div className="min-h-screen bg-brand-bg">
      {/* Header */}
      <header className="sticky top-0 z-50 bg-brand-bg border-b border-brand-border">
        <div className="max-w-[1240px] mx-auto px-8 py-[22px] flex items-center justify-between">
          <a href="/" className="font-heading text-[22px] text-brand-dark tracking-tight">
            Gabriela&apos;s Premier Pet Care
          </a>
          <nav className="hidden md:flex items-center gap-9 text-[16px]">
            <a href="/" className="text-brand-dark border-b-2 border-brand-dark pb-1">Home</a>
            <a href="/about" className="text-brand-dark border-b-2 border-transparent hover:border-brand-dark pb-1 transition">About</a>
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

      {/* Hero */}
      <section className="relative h-[clamp(520px,78vh,760px)] bg-[#222] overflow-hidden">
        <img
          src="https://images.squarespace-cdn.com/content/v1/69b4c6f521311439992d2041/1773525046618-79KEO31XECGHA26O9L0N/unsplash-image-ouo1hbizWwo.jpg"
          alt="Cat and dog lying together in grass"
          className="absolute inset-0 w-full h-full object-cover brightness-[0.72]"
        />
        <div className="absolute inset-0 flex flex-col items-center justify-center text-center px-6 gap-7">
          <h1 className="font-heading text-[#c6d6e8] text-[clamp(2.4rem,6vw,5.5rem)] leading-[1.1] max-w-[14ch] drop-shadow-[0_2px_12px_rgba(0,0,0,0.35)]">
            Loving Care When You&apos;re Not There
          </h1>
          <a
            href="/book"
            className="px-10 py-4 bg-white text-brand-dark rounded-full text-[17px] font-semibold shadow-[0_4px_20px_rgba(0,0,0,0.25)] hover:bg-[#e8e6df] hover:-translate-y-0.5 hover:shadow-[0_6px_28px_rgba(0,0,0,0.3)] transition-all inline-block"
          >
            Book Now
          </a>
        </div>
      </section>

      {/* Intro */}
      <section className="py-24">
        <div className="max-w-[1240px] mx-auto px-8 grid md:grid-cols-2 gap-[72px] items-center">
          <div>
            <h2 className="font-heading text-[clamp(2rem,4vw,3.25rem)] leading-[1.1] mb-6">
              Trusted Dog Sitting &amp; Pet Care
            </h2>
            <p className="mb-4">Hi! I&apos;m Gabriela, the owner of a local pet sitting service dedicated to giving your pets the love, attention, and care they deserve while you&apos;re away.</p>
            <p className="mb-4">Whether you need drop-in visits, dog walking, or overnight sitting, I treat every pet like family.</p>
            <ul className="pl-[1.1em] mt-4 space-y-2 list-disc">
              <li>Reliable &amp; responsible pet sitter</li>
              <li>Loving care for every pet</li>
              <li>Flexible scheduling</li>
              <li>Daily walks &amp; playtime</li>
              <li>Photos and update messages while you&apos;re away</li>
              <li>Safe and stress-free care for your pets</li>
            </ul>
          </div>
          <div className="rounded-md overflow-hidden aspect-[4/5] bg-[#ddd]">
            <img
              src="https://images.squarespace-cdn.com/content/v1/69b4c6f521311439992d2041/1773524696541-JU0PB1N30UENOIR3ZRY3/unsplash-image-Ivzo69e18nk.jpg"
              alt="Dog and cat relaxing together"
              className="w-full h-full object-cover"
            />
          </div>
        </div>
      </section>

      {/* Services */}
      <section className="py-24">
        <div className="max-w-[1240px] mx-auto px-8">
          <h2 className="font-heading text-[clamp(2rem,4vw,3.25rem)] leading-[1.1] mb-8 text-center">Our Services</h2>
          <div className="grid md:grid-cols-3 gap-8">
            {[
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
                desc: 'Stay overnight to ensure your pet feels safe and comfortable through the night.',
                img: 'https://images.squarespace-cdn.com/content/v1/69b4c6f521311439992d2041/1773612219275-LT3NFMMF9T88700F28SY/unsplash-image-QPNUabsYMRY.jpg',
              },
            ].map(s => (
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
        <h2 className="font-heading text-[clamp(2rem,4vw,3.25rem)] leading-[1.1] mb-6">Grab your spot</h2>
        <p className="max-w-[56ch] mx-auto text-[#333] mb-7">Prices vary depending on the service and number of pets. Contact me for a custom quote.</p>
        <a
          href="/book"
          className="px-7 py-3.5 bg-brand-dark text-white rounded-full text-[15px] hover:bg-[#2a2a2a] hover:-translate-y-px transition-all inline-block"
        >
          Book an Appointment
        </a>
      </section>

      {/* Social grid */}
      <section className="py-24">
        <div className="max-w-[1240px] mx-auto px-8">
          <div className="flex justify-between items-end flex-wrap gap-6 mb-10">
            <h2 className="font-heading text-[clamp(2rem,4vw,3.25rem)] leading-[1.1]">Follow us on social</h2>
          </div>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-[18px]">
            {[
              'https://images.squarespace-cdn.com/content/v1/69b4c6f521311439992d2041/1773624760755-S67IISD2VJ8BYKHZ5LRC/unsplash-image-u_kMWN-BWyU.jpg',
              'https://images.squarespace-cdn.com/content/v1/69b4c6f521311439992d2041/1773625262185-MMI8O6QIEA1SGQCBDV8M/unsplash-image-aXe4Ufe3IV4.jpg',
              'https://images.squarespace-cdn.com/content/v1/69b4c6f521311439992d2041/1773625426985-0G8LSWG88CMCJI8W3H9V/unsplash-image-0SWZlIKKAMY.jpg',
              'https://images.squarespace-cdn.com/content/v1/69b4c6f521311439992d2041/1773625059812-R6UTB1QT9GSNGC8NE22I/unsplash-image-SDIIfq6nhFU.jpg',
            ].map((img, i) => (
              <div key={i} className="aspect-square overflow-hidden rounded bg-[#ddd] group">
                <img src={img} alt="" className="w-full h-full object-cover group-hover:scale-[1.04] transition-transform duration-[400ms]" />
              </div>
            ))}
          </div>
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
