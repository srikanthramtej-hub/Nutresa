

import React, { useEffect, useRef, useState, useCallback } from 'react'
import { useNavigate } from 'react-router-dom'
import gsap from 'gsap'
import ScrollTrigger from 'gsap/ScrollTrigger'
import ProductCard from '../../components/ProductCard/ProductCard'
import Footer from '../../components/Footer/Footer'
import { productsAPI } from '../../api'
import './HomePage.css'

gsap.registerPlugin(ScrollTrigger)

// ── Fruit images for cursor trail ──
const TRAIL_IMGS = [
  '/dryfruits/almond.png',
  '/dryfruits/cashew.png',
  '/dryfruits/dates.png',
  '/dryfruits/fig.png',
  '/dryfruits/pistachio.png',
  '/dryfruits/walnut.png',
  '/dryfruits/raisins.png',
]

// ── Stats data ──
const STATS = [
  { value: '14+', label: 'Years sourcing' },
  { value: '38',  label: 'Origin farms' },
  { value: '99%', label: 'Natural purity' },
  { value: '60k', label: 'Happy households' },
]

// ── Featured categories ──
const CATEGORIES = [
  { name: 'Almonds',    img: '/dryfruits/almond.png',    note: 'California · Organic' },
  { name: 'Cashews',    img: '/dryfruits/cashew.png',    note: 'Vietnam · Grade W320' },
  { name: 'Pistachios', img: '/dryfruits/pistachio.png', note: 'Iran · Long grain' },
  { name: 'Walnuts',    img: '/dryfruits/walnut.png',    note: 'Kashmiri · Light halves' },
  { name: 'Dates',      img: '/dryfruits/dates.png',     note: 'Medjool · Jumbo' },
  { name: 'Figs',       img: '/dryfruits/fig.png',       note: 'Turkish · Sun-dried' },
]

export default function HomePage({ onOpenProduct }) {
  const navigate  = useNavigate()
  const homeRef   = useRef(null)
  const ctxRef    = useRef(null)
  const revealRef = useRef([])

  const [products, setProducts] = useState([])
  const [loading,  setLoading]  = useState(true)

  // ── Fetch products ───
  useEffect(() => {
    productsAPI.getAll()
      .then(res => {
        const items = Array.isArray(res.data) ? res.data : (res.data?.products ?? [])
        setProducts(items.slice(0, 4))
      })
      .catch(() => setProducts([]))
      .finally(() => setLoading(false))
  }, [])

  // ── Hero GSAP entrance ───
  useEffect(() => {
    const timer = setTimeout(() => {
      ctxRef.current = gsap.context(() => {

        // Hero timeline — each element slides in from its natural direction
        const tl = gsap.timeline({ defaults: { ease: 'expo.out' } })

        tl.fromTo('.hp-hero__label',
            { y: 18, autoAlpha: 0 },
            { y: 0,  autoAlpha: 1, duration: 0.7 }
          )
          .fromTo('.hp-hero__line1',
            { y: 60, autoAlpha: 0 },
            { y: 0,  autoAlpha: 1, duration: 1.1 }, '-=0.3'
          )
          .fromTo('.hp-hero__line2',
            { y: 60, autoAlpha: 0 },
            { y: 0,  autoAlpha: 1, duration: 1.1 }, '-=0.8'
          )
          .fromTo('.hp-hero__body',
            { y: 24, autoAlpha: 0 },
            { y: 0,  autoAlpha: 1, duration: 0.8 }, '-=0.6'
          )
          .fromTo('.hp-hero__cta > *',
            { y: 20, autoAlpha: 0 },
            { y: 0,  autoAlpha: 1, stagger: 0.12, duration: 0.6 }, '-=0.5'
          )
          .fromTo('.hp-hero__card',
            { y: 40, autoAlpha: 0, scale: 0.96 },
            { y: 0,  autoAlpha: 1, scale: 1, stagger: 0.15, duration: 0.9 }, '-=0.8'
          )
          .fromTo('.hp-hero__scroll-hint',
            { autoAlpha: 0 },
            { autoAlpha: 1, duration: 0.6 }, '-=0.2'
          )

        // Subtle parallax on hero cards on scroll
        gsap.to('.hp-hero__visual', {
          yPercent: 18,
          ease: 'none',
          scrollTrigger: { trigger: '.hp-hero', start: 'top top', end: 'bottom top', scrub: true },
        })

      }, homeRef)
    }, 60)

    return () => { clearTimeout(timer); ctxRef.current?.revert() }
  }, [])

  // ── IntersectionObserver for below-fold reveals ──────────
  useEffect(() => {
    const obs = new IntersectionObserver(
      (entries) => {
        entries.forEach(entry => {
          if (entry.isIntersecting) {
            entry.target.classList.add('is-visible')
            obs.unobserve(entry.target)
          }
        })
      },
      { threshold: 0.12 }
    )
    revealRef.current.forEach(el => el && obs.observe(el))
    return () => obs.disconnect()
  }, [products]) // re-run when products load so product cards are observed

  const addReveal = useCallback(el => {
    if (el && !revealRef.current.includes(el)) revealRef.current.push(el)
  }, [])

  // ── Cursor fruit trail ───
  useEffect(() => {
    let lastMove = 0
    const onMove = (e) => {
      const now = Date.now()
      if (now - lastMove < 90) return
      lastMove = now

      const img   = document.createElement('img')
      img.src     = TRAIL_IMGS[Math.floor(Math.random() * TRAIL_IMGS.length)]
      img.className = 'hp-trail-img'
      img.style.left = `${e.clientX}px`
      img.style.top  = `${e.clientY}px`
      document.body.appendChild(img)

      gsap.fromTo(img,
        { scale: 0, opacity: 0.9 },
        {
          scale: 1.1, opacity: 0,
          x: (Math.random() - 0.5) * 160,
          y: (Math.random() - 0.5) * 160,
          rotate: (Math.random() - 0.5) * 180,
          duration: 1.8,
          ease: 'power2.out',
          onComplete: () => img.remove(),
        }
      )
    }
    window.addEventListener('mousemove', onMove)
    return () => window.removeEventListener('mousemove', onMove)
  }, [])


  return (
    <div className="hp" ref={homeRef}>

      <section className="hp-hero" aria-label="Hero">

        {/* Left: typography column */}
        <div className="hp-hero__content">
          <p className="hp-hero__label">
            <span className="hp-hero__label-dot" aria-hidden="true" /> Premium Organic Collection
          </p>

          <h1 className="hp-hero__headline" aria-label="Nature's Finest, Delivered Fresh">
            <span className="hp-hero__line1">Nature's</span>
            <span className="hp-hero__line2">Finest.</span>
          </h1>

          <p className="hp-hero__body">
            Premium dry fruits and natural products sourced directly
            from trusted farms — harvested at peak ripeness, packed
            with care, delivered to your door.
          </p>

          <div className="hp-hero__cta">
            <button className="hp-btn hp-btn--primary" onClick={() => navigate('/shop')}>
              Shop Collection
            </button>
            <button className="hp-btn hp-btn--ghost" onClick={() => navigate('/about')}>
              Our Story <span className="hp-btn__arrow" aria-hidden="true">→</span>
            </button>
          </div>

          <p className="hp-hero__scroll-hint" aria-hidden="true">
            Scroll to explore ↓
          </p>
        </div>

        {/* Right: staggered card collage */}
        <div className="hp-hero__visual" aria-hidden="true">
          <div className="hp-hero__card hp-hero__card--a">
            <img src="/dryfruits/almond.png" alt="" />
            <p>Almonds</p>
          </div>
          <div className="hp-hero__card hp-hero__card--b">
            <img src="/dryfruits/walnut.png" alt="" />
            <p>Walnuts</p>
          </div>
          <div className="hp-hero__card hp-hero__card--c">
            <img src="/dryfruits/pistachio.png" alt="" />
            <p>Pistachios</p>
          </div>
          <div className="hp-hero__card hp-hero__card--d">
            <img src="/dryfruits/dates.png" alt="" />
            <p>Dates</p>
          </div>
        </div>

      </section>

      <section className="hp-categories reveal-section" ref={addReveal} aria-label="Product categories">
        <div className="hp-section-header">
          <p className="hp-eyebrow">Sourced Worldwide</p>
          <h2 className="hp-section-title">Shop by Origin</h2>
        </div>
        <div className="hp-categories__grid">
          {CATEGORIES.map(cat => (
            <button
              key={cat.name}
              className="hp-cat-card"
              onClick={() => navigate('/shop')}
              aria-label={`Browse ${cat.name}`}
            >
              <div className="hp-cat-card__img-wrap">
                <img src={cat.img} alt={cat.name} />
              </div>
              <p className="hp-cat-card__name">{cat.name}</p>
              <p className="hp-cat-card__note">{cat.note}</p>
            </button>
          ))}
        </div>
      </section>


      <section className="hp-products reveal-section" ref={addReveal} aria-label="Best sellers">
        <div className="hp-section-header">
          <p className="hp-eyebrow">Best Sellers</p>
          <h2 className="hp-section-title">Curated Collection</h2>
          <button
            className="hp-section-header__link"
            onClick={() => navigate('/shop')}
            aria-label="View all products"
          >
            View All <span aria-hidden="true">→</span>
          </button>
        </div>

        <div className="hp-products__grid">
          {loading
            ? [1, 2, 3, 4].map(i => (
                <div key={i} className="hp-skeleton" aria-hidden="true" />
              ))
            : products.map(product => (
                <div
                  className="hp-product-wrap reveal-item"
                  key={product.id}
                  ref={addReveal}
                >
                  <ProductCard product={product} onOpenModal={onOpenProduct} />
                </div>
              ))
          }
        </div>
      </section>


      <section className="hp-editorial reveal-section" ref={addReveal} aria-label="Brand story">
        <div className="hp-editorial__inner">
          <div className="hp-editorial__text">
            <p className="hp-eyebrow hp-eyebrow--light">Our Commitment</p>
            <h2 className="hp-editorial__headline">
              From the farm.<br />
              <em>To your table.</em>
            </h2>
            <p className="hp-editorial__body">
              Every batch is hand-selected at source, tested for purity,
              and packed in eco-conscious materials. No middlemen.
              No compromises. Just the real thing.
            </p>
            <button
              className="hp-btn hp-btn--light"
              onClick={() => navigate('/about')}
            >
              Discover Our Process
            </button>
          </div>
          <div className="hp-editorial__visual" aria-hidden="true">
            <div className="hp-editorial__orb hp-editorial__orb--1" />
            <div className="hp-editorial__orb hp-editorial__orb--2" />
            <div className="hp-editorial__fruit-grid">
              {[
                '/dryfruits/fig.png',
                '/dryfruits/raisins.png',
                '/dryfruits/pumpkin.png',
                '/dryfruits/sunflower.png',
              ].map((src, i) => (
                <img key={i} src={src} alt="" className="hp-editorial__fruit" />
              ))}
            </div>
          </div>
        </div>
      </section>


      <section className="hp-trust reveal-section" ref={addReveal} aria-label="Why choose us">
        {[
          {
            icon: '🌿',
            title: '100% Natural',
            body: 'Nothing added. No preservatives, artificial colours, or flavours. Ever.',
          },
          {
            icon: '♻️',
            title: 'Eco Packaging',
            body: 'Compostable kraft bags and glass jars. Beautiful and responsible.',
          },
          {
            icon: '🚚',
            title: 'Farm Direct',
            body: 'We work with farming families directly — fresher product, fairer prices.',
          },
        ].map(pillar => (
          <div className="hp-trust__pillar" key={pillar.title}>
            <span className="hp-trust__icon" aria-hidden="true">{pillar.icon}</span>
            <h3 className="hp-trust__title">{pillar.title}</h3>
            <p className="hp-trust__body">{pillar.body}</p>
          </div>
        ))}
      </section>


      {/* <section className="hp-testimonials reveal-section" ref={addReveal} aria-label="Customer reviews">
        <p className="hp-eyebrow" style={{ textAlign: 'center', marginBottom: '40px' }}>
          Loved By Thousands
        </p>
        <div className="hp-testi-track" aria-hidden="true">
          {[...Array(2)].flatMap((_, pass) =>
            [
              { text: 'The freshness is unreal. Almonds arrived vacuum-sealed and tasted like they were picked yesterday.', author: 'Priya S., Mumbai' },
              { text: 'Finally a brand that doesnt cut corners on quality. Worth every rupee.', author: 'Arjun M., Bangalore' },
              { text: 'Love the eco-packaging. The dates are phenomenal — plump, sweet, not sugary.', author: 'Nadia K., Hyderabad' },
              { text: 'Gifted a hamper to my parents and they absolutely adored it. Repeat purchase guaranteed.', author: 'Rohan T., Delhi' },
              { text: 'Switched from supermarket dry fruits and theres no going back. The difference is night and day.', author: 'Lakshmi R., Chennai' },
            ].map((t, i) => (
              <div className="hp-testi-card" key={`${pass}-${i}`}>
                <p className="hp-testi-card__stars" aria-label="5 stars">★★★★★</p>
                <p className="hp-testi-card__text">"{t.text}"</p>
                <p className="hp-testi-card__author">— {t.author}</p>
              </div>
            ))
          )}
        </div>
      </section> */}


      <section className="hp-cta reveal-section" ref={addReveal} aria-label="Call to action">
        <p className="hp-eyebrow">Ready?</p>
        <h2 className="hp-cta__headline">
          Taste the difference<br />real nature makes.
        </h2>
        <button
          className="hp-btn hp-btn--primary hp-btn--lg"
          onClick={() => navigate('/shop')}
        >
          Explore the Collection
        </button>
      </section>

      <Footer />
    </div>
  )
}