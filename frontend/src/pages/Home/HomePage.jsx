import React, { useEffect, useRef, useState, useCallback } from 'react'
import { useNavigate } from 'react-router-dom'
import gsap from 'gsap'
import ScrollTrigger from 'gsap/ScrollTrigger'
import ProductCard from '../../components/ProductCard/ProductCard'
import Footer from '../../components/Footer/Footer'
import { productsAPI } from '../../api'
import './HomePage.css'

gsap.registerPlugin(ScrollTrigger)

const TRAIL_IMGS = [
  '/dryfruits/almond.png','/dryfruits/cashew.png','/dryfruits/dates.png',
  '/dryfruits/fig.png','/dryfruits/pistachio.png','/dryfruits/walnut.png','/dryfruits/raisins.png',
]

const CATEGORIES = [
  { name: 'Almonds',    img: '/dryfruits/almond.png',    note: 'California · Organic' },
  { name: 'Cashews',    img: '/dryfruits/cashew.png',    note: 'Vietnam · Grade W320' },
  { name: 'Pistachios', img: '/dryfruits/pistachio.png', note: 'Iran · Long grain' },
  { name: 'Walnuts',    img: '/dryfruits/walnut.png',    note: 'Kashmiri · Light halves' },
  { name: 'Dates',      img: '/dryfruits/dates.png',     note: 'Medjool · Jumbo' },
  { name: 'Figs',       img: '/dryfruits/fig.png',       note: 'Turkish · Sun-dried' },
]

const PILLARS = [
  { icon: '🌿', title: '100% Natural',  body: 'No preservatives, artificial colours, or flavours. Ever.' },
  { icon: '♻️', title: 'Eco Packaging', body: 'Compostable kraft bags and glass jars. Beautiful and responsible.' },
  { icon: '🚚', title: 'Farm Direct',   body: 'Farming families directly — fresher product, fairer prices.' },
]

const TESTIMONIALS = [
  { text: 'The freshness is unreal. Almonds arrived vacuum-sealed and tasted like they were picked yesterday.', author: 'Priya S.', city: 'Mumbai', stars: 5 },
  { text: "Finally a brand that doesn't cut corners on quality. Worth every rupee.", author: 'Arjun M.', city: 'Bangalore', stars: 5 },
  { text: 'Love the eco-packaging. The dates are phenomenal — plump, sweet, not sugary.', author: 'Nadia K.', city: 'Hyderabad', stars: 5 },
  { text: 'Gifted a hamper to my parents and they absolutely adored it. Repeat purchase guaranteed.', author: 'Rohan T.', city: 'Delhi', stars: 5 },
  { text: "Switched from supermarket dry fruits and there's no going back. Night and day difference.", author: 'Lakshmi R.', city: 'Chennai', stars: 5 },
]

export default function HomePage() {
  const navigate  = useNavigate()
  const homeRef   = useRef(null)
  const ctxRef    = useRef(null)
  const revealRef = useRef([])

  const [products, setProducts] = useState([])
  const [loading,  setLoading]  = useState(true)

  useEffect(() => {
    productsAPI.getAll()
      .then(res => {
        const items = Array.isArray(res.data) ? res.data : (res.data?.products ?? [])
        setProducts(items.slice(0, 4))
      })
      .catch(() => setProducts([]))
      .finally(() => setLoading(false))
  }, [])

  // ── Hero GSAP — ALL ORIGINAL ANIMATIONS KEPT ──
  useEffect(() => {
    const timer = setTimeout(() => {
      ctxRef.current = gsap.context(() => {
        const tl = gsap.timeline({ defaults: { ease: 'expo.out' } })
        tl.fromTo('.hp-hero__label',       { y: 18, autoAlpha: 0 }, { y: 0, autoAlpha: 1, duration: 0.7 })
          .fromTo('.hp-hero__line1',       { y: 60, autoAlpha: 0 }, { y: 0, autoAlpha: 1, duration: 1.1 }, '-=0.3')
          .fromTo('.hp-hero__line2',       { y: 60, autoAlpha: 0 }, { y: 0, autoAlpha: 1, duration: 1.1 }, '-=0.8')
          .fromTo('.hp-hero__body',        { y: 24, autoAlpha: 0 }, { y: 0, autoAlpha: 1, duration: 0.8 }, '-=0.6')
          .fromTo('.hp-hero__cta > *',     { y: 20, autoAlpha: 0 }, { y: 0, autoAlpha: 1, stagger: 0.12, duration: 0.6 }, '-=0.5')
          .fromTo('.hp-hero__pill',        { y: 14, autoAlpha: 0 }, { y: 0, autoAlpha: 1, stagger: 0.1, duration: 0.5 }, '-=0.4')
          .fromTo('.hp-hero__scroll-hint', { autoAlpha: 0 }, { autoAlpha: 1, duration: 0.6 }, '-=0.2')
      }, homeRef)
    }, 60)
    return () => { clearTimeout(timer); ctxRef.current?.revert() }
  }, [])

  // ── Scroll reveals ──
  useEffect(() => {
    const obs = new IntersectionObserver(
      entries => entries.forEach(e => { if (e.isIntersecting) { e.target.classList.add('is-visible'); obs.unobserve(e.target) } }),
      { threshold: 0.1 }
    )
    revealRef.current.forEach(el => el && obs.observe(el))
    return () => obs.disconnect()
  }, [products])

  const addReveal = useCallback(el => {
    if (el && !revealRef.current.includes(el)) revealRef.current.push(el)
  }, [])

  // ── Cursor trail ──
  useEffect(() => {
    let lastMove = 0
    const onMove = (e) => {
      const now = Date.now()
      if (now - lastMove < 90) return
      lastMove = now
      const img = document.createElement('img')
      img.src = TRAIL_IMGS[Math.floor(Math.random() * TRAIL_IMGS.length)]
      img.className = 'hp-trail-img'
      img.style.left = `${e.clientX}px`
      img.style.top  = `${e.clientY}px`
      document.body.appendChild(img)
      gsap.fromTo(img,
        { scale: 0, opacity: 0.9 },
        { scale: 1.1, opacity: 0, x: (Math.random()-0.5)*160, y: (Math.random()-0.5)*160,
          rotate: (Math.random()-0.5)*180, duration: 1.8, ease: 'power2.out',
          onComplete: () => img.remove() }
      )
    }
    window.addEventListener('mousemove', onMove)
    return () => window.removeEventListener('mousemove', onMove)
  }, [])

  return (
    <div className="hp" ref={homeRef}>

      {/* ══ HERO — full width, centred ══ */}
      <section className="hp-hero" aria-label="Hero">

        {/* Logo top-centre */}
        <div className="hp-hero__logo-wrap">
          <img src="/logo.png" alt="Nutresa" className="hp-hero__logo-img" />
        </div>

        <p className="hp-hero__label">
          <span className="hp-hero__label-dot" /> Premium Organic Collection
        </p>

        <h1 className="hp-hero__headline">
          <span className="hp-hero__line1">Nature's</span>
          <span className="hp-hero__line2">Finest.</span>
        </h1>

        <p className="hp-hero__body">
          Premium dry fruits and natural products sourced directly from trusted farms —
          harvested at peak ripeness, packed with care, delivered to your door.
        </p>

        <div className="hp-hero__cta">
          <button className="hp-btn hp-btn--primary" onClick={() => navigate('/shop')}>
            Shop Collection
          </button>
          <button className="hp-btn hp-btn--ghost" onClick={() => navigate('/about')}>
            Our Story <span className="hp-btn__arrow">→</span>
          </button>
        </div>

        {/* Trust pills below buttons */}
        <div className="hp-hero__pills">
          <span className="hp-hero__pill">🏆 Award-winning quality</span>
          <span className="hp-hero__pill">✈️ Ships pan-India</span>
          <span className="hp-hero__pill">🔒 Secure checkout</span>
          <span className="hp-hero__pill">🌱 100% Natural</span>
        </div>

        <p className="hp-hero__scroll-hint">Scroll to explore ↓</p>

        {/* Background decoration — subtle orbs */}
        <div className="hp-hero__bg-orb hp-hero__bg-orb--1" aria-hidden="true" />
        <div className="hp-hero__bg-orb hp-hero__bg-orb--2" aria-hidden="true" />
        <div className="hp-hero__bg-orb hp-hero__bg-orb--3" aria-hidden="true" />
      </section>

      {/* ══ MARQUEE ══ */}
      <div className="hp-marquee" aria-hidden="true">
        <div className="hp-marquee__track">
          {[...Array(3)].flatMap((_, i) =>
            ['Premium Almonds','Organic Cashews','Medjool Dates','Kashmiri Walnuts','Turkish Figs','Iranian Pistachios','Sun-dried Raisins'].map((t,j) => (
              <span key={`${i}-${j}`} className="hp-marquee__item"><span className="hp-marquee__dot" />{t}</span>
            ))
          )}
        </div>
      </div>

      {/* ══ CATEGORIES ══ */}
      <section className="hp-categories reveal-section" ref={addReveal}>
        <div className="hp-section-header">
          <p className="hp-eyebrow">Sourced Worldwide</p>
          <h2 className="hp-section-title">Shop by Origin</h2>
        </div>
        <div className="hp-categories__grid">
          {CATEGORIES.map(cat => (
            <button key={cat.name} className="hp-cat-card" onClick={() => navigate('/shop')}>
              <div className="hp-cat-card__img-wrap"><img src={cat.img} alt={cat.name} /></div>
              <p className="hp-cat-card__name">{cat.name}</p>
              <p className="hp-cat-card__note">{cat.note}</p>
              <span className="hp-cat-card__arrow">→</span>
            </button>
          ))}
        </div>
      </section>

      {/* ══ PRODUCTS ══ */}
      <section className="hp-products reveal-section" ref={addReveal}>
        <div className="hp-section-header hp-section-header--row">
          <div>
            <p className="hp-eyebrow">Best Sellers</p>
            <h2 className="hp-section-title">Curated Collection</h2>
          </div>
          <button className="hp-view-all-btn" onClick={() => navigate('/shop')}>
            View All Products <span>→</span>
          </button>
        </div>
        <div className="hp-products__grid">
          {loading
            ? [1,2,3,4].map(i => <div key={i} className="hp-skeleton" />)
            : products.map(p => (
                <div key={p.id} className="hp-product-wrap reveal-item" ref={addReveal}>
                  <ProductCard product={p} />
                </div>
              ))
          }
        </div>
      </section>

      {/* ══ EDITORIAL ══ */}
      <section className="hp-editorial reveal-section" ref={addReveal}>
        <div className="hp-editorial__inner">
          <div className="hp-editorial__text">
            <p className="hp-eyebrow">Our Commitment</p>
            <h2 className="hp-editorial__headline">
              From the farm.<br />
              <em>To your table.</em>
            </h2>
            <p className="hp-editorial__body">
              Every batch is hand-selected at source, tested for purity,
              and packed in eco-conscious materials. No middlemen. No compromises.
            </p>
            <div className="hp-editorial__badges">
              <span className="hp-editorial__badge">🌱 Pesticide-free</span>
              <span className="hp-editorial__badge">🔬 Purity tested</span>
              <span className="hp-editorial__badge">📦 Eco packed</span>
            </div>
            <button className="hp-btn hp-btn--light" onClick={() => navigate('/about')}>
              Discover Our Process
            </button>
          </div>
          <div className="hp-editorial__visual" aria-hidden="true">
            <div className="hp-editorial__orb hp-editorial__orb--1" />
            <div className="hp-editorial__orb hp-editorial__orb--2" />
            <div className="hp-editorial__fruit-grid">
              {['/dryfruits/fig.png','/dryfruits/raisins.png','/dryfruits/pumpkin.png','/dryfruits/sunflower.png'].map((s,i) => (
                <img key={i} src={s} alt="" className="hp-editorial__fruit" />
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* ══ TRUST ══ */}
      <section className="hp-trust reveal-section" ref={addReveal}>
        {PILLARS.map(p => (
          <div key={p.title} className="hp-trust__pillar">
            <div className="hp-trust__icon-wrap"><span className="hp-trust__icon">{p.icon}</span></div>
            <h3 className="hp-trust__title">{p.title}</h3>
            <p className="hp-trust__body">{p.body}</p>
          </div>
        ))}
      </section>

      {/* ══ TESTIMONIALS ══ */}
      {/* <section className="hp-testimonials reveal-section" ref={addReveal}>
        <div className="hp-section-header">
          <p className="hp-eyebrow">What People Say</p>
          <h2 className="hp-section-title">Loved by Thousands</h2>
        </div>
        <div className="hp-testi-track" aria-hidden="true">
          {[...Array(2)].flatMap((_, pass) =>
            TESTIMONIALS.map((t, i) => (
              <div key={`${pass}-${i}`} className="hp-testi-card">
                <div className="hp-testi-card__stars">{'★'.repeat(t.stars)}</div>
                <p className="hp-testi-card__text">"{t.text}"</p>
                <div className="hp-testi-card__footer">
                  <div className="hp-testi-card__avatar">{t.author[0]}</div>
                  <div>
                    <p className="hp-testi-card__author">{t.author}</p>
                    <p className="hp-testi-card__city">{t.city}</p>
                  </div>
                </div>
              </div>
            ))
          )}
        </div>
      </section> */}

      {/* ══ CTA ══ */}
      <section className="hp-cta reveal-section" ref={addReveal}>
        <div className="hp-cta__inner">
          <p className="hp-eyebrow">Ready?</p>
          <h2 className="hp-cta__headline">
            Taste the difference<br />
            <span>real nature makes.</span>
          </h2>
          <p className="hp-cta__sub">Free delivery above ₹499 · 100% natural · Eco packaging</p>
          <div className="hp-cta__actions">
            <button className="hp-btn hp-btn--primary hp-btn--lg" onClick={() => navigate('/shop')}>
              Explore the Collection
            </button>
            <button className="hp-btn hp-btn--outline-light hp-btn--lg" onClick={() => navigate('/about')}>
              About Nutresa
            </button>
          </div>
        </div>
        <div className="hp-cta__fruits" aria-hidden="true">
          {['/dryfruits/almond.png','/dryfruits/cashew.png','/dryfruits/walnut.png','/dryfruits/pistachio.png','/dryfruits/dates.png'].map((s,i) => (
            <img key={i} src={s} alt="" className="hp-cta__fruit" />
          ))}
        </div>
      </section>

      <Footer />
    </div>
  )
}