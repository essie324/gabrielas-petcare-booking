'use client'

import { useState } from 'react'

export default function ContactPage() {
  const [submitted, setSubmitted] = useState(false)

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
            <a href="/services" className="text-brand-dark border-b-2 border-transparent hover:border-brand-dark pb-1 transition">Services</a>
            <a href="/book" className="text-brand-dark border-b-2 border-transparent hover:border-brand-dark pb-1 transition">Book Appointment</a>
            <a href="/contact" className="text-brand-dark border-b-2 border-brand-dark pb-1">Contact</a>
          </nav>
          <a
            href="/book"
            className="px-7 py-3.5 bg-brand-dark text-white rounded-full text-[15px] hover:bg-[#2a2a2a] transition inline-block"
          >
            Book
          </a>
        </div>
      </header>

      {/* Contact Content */}
      <section className="py-24">
        <div className="max-w-[1240px] mx-auto px-8 grid md:grid-cols-2 gap-[72px] items-start">
          <div className="rounded-md overflow-hidden aspect-[4/5] bg-[#ddd]">
            <img
              src="https://images.squarespace-cdn.com/content/v1/69b4c6f521311439992d2041/1773622082687-PJR0KACG17HH7O1P91FL/unsplash-image-f5xgRDV5YXk.jpg"
              alt="Two birds perched together"
              className="w-full h-full object-cover"
            />
          </div>

          <div>
            <h1 className="font-heading text-[clamp(2rem,4vw,3.25rem)] leading-[1.1] mb-6">Contact Us</h1>
            <p className="mb-2">Have questions or want to schedule pet sitting?</p>
            <p className="mb-4">Serving the Orlando, FL area.</p>
            <p className="mb-1">
              <a href="mailto:gabrielaspremierpetcare@gmail.com" className="text-brand-dark underline hover:no-underline">
                gabrielaspremierpetcare@gmail.com
              </a>
            </p>
            <p className="mb-6">
              <a href="tel:+14076987386" className="text-brand-dark underline hover:no-underline">
                (407) 698-7386
              </a>
            </p>
            <p className="text-[#444] mb-8">Fill out the contact form below and I&apos;ll get back to you as soon as possible.</p>

            {submitted ? (
              <div className="bg-green-50 border border-green-200 rounded-2xl p-8 text-center">
                <div className="w-16 h-16 mx-auto mb-4 bg-green-100 rounded-full flex items-center justify-center">
                  <svg className="w-8 h-8 text-green-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                  </svg>
                </div>
                <h3 className="font-heading text-xl mb-2">Message Sent!</h3>
                <p className="text-[#444]">We&apos;ll get back to you as soon as possible.</p>
              </div>
            ) : (
              <form
                action="https://docs.google.com/forms/d/e/1FAIpQLSe9qQ9rUerTC3q99Zz30phL_prx43UDuQzgz_knIEQSplzYjA/formResponse"
                method="POST"
                target="hidden_iframe"
                onSubmit={() => setSubmitted(true)}
                className="space-y-5"
              >
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="text-sm text-gray-500 mb-1 block">First name *</label>
                    <input
                      type="text"
                      name="entry.868639982"
                      required
                      className="w-full px-4 py-3 rounded-xl border border-brand-border bg-white text-brand-dark focus:outline-none focus:ring-2 focus:ring-brand-dark/30 focus:border-brand-dark transition"
                    />
                  </div>
                  <div>
                    <label className="text-sm text-gray-500 mb-1 block">Last name *</label>
                    <input
                      type="text"
                      name="entry.1881578238"
                      required
                      className="w-full px-4 py-3 rounded-xl border border-brand-border bg-white text-brand-dark focus:outline-none focus:ring-2 focus:ring-brand-dark/30 focus:border-brand-dark transition"
                    />
                  </div>
                </div>
                <div>
                  <label className="text-sm text-gray-500 mb-1 block">Phone *</label>
                  <input
                    type="tel"
                    name="entry.379595526"
                    required
                    className="w-full px-4 py-3 rounded-xl border border-brand-border bg-white text-brand-dark focus:outline-none focus:ring-2 focus:ring-brand-dark/30 focus:border-brand-dark transition"
                  />
                </div>
                <div>
                  <label className="text-sm text-gray-500 mb-1 block">Email</label>
                  <input
                    type="email"
                    name="entry.1374419958"
                    className="w-full px-4 py-3 rounded-xl border border-brand-border bg-white text-brand-dark focus:outline-none focus:ring-2 focus:ring-brand-dark/30 focus:border-brand-dark transition"
                  />
                </div>
                <div>
                  <label className="text-sm text-gray-500 mb-1 block">Message *</label>
                  <textarea
                    name="entry.857078472"
                    required
                    rows={5}
                    className="w-full px-4 py-3 rounded-xl border border-brand-border bg-white text-brand-dark focus:outline-none focus:ring-2 focus:ring-brand-dark/30 focus:border-brand-dark transition resize-none"
                  />
                </div>
                <button
                  type="submit"
                  className="w-full py-4 bg-brand-dark text-white rounded-xl font-medium text-lg hover:bg-[#2a2a2a] transition"
                >
                  Send
                </button>
              </form>
            )}
            <iframe name="hidden_iframe" className="hidden" />
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
