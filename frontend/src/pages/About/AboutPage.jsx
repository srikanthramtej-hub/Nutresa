import React from 'react';
import { useNavigate } from 'react-router-dom';
import Footer from '../../components/Footer/Footer';
import './AboutPage.css';

const infoCards = [
  {
    icon: '🌳',
    title: 'The Ancient Harvest',
    text: 'Cashews grow on trees native to Brazil, now cultivated across India, Vietnam, and Africa. Each cashew apple holds a single nut — carefully extracted by hand by skilled farmers who have practiced this craft for generations.',
  },
  {
    icon: '☀️',
    title: 'Sun-Drying Magic',
    text: 'Fresh fruits like dates, figs, and apricots are laid under the sun for days or weeks. The slow evaporation of moisture concentrates sugars, vitamins, and minerals into a nutrient-dense powerhouse.',
  },
  {
    icon: '💪',
    title: 'Nutritional Powerhouse',
    text: 'A 30g handful of mixed nuts provides over 6g of protein, heart-healthy fats, Vitamin E, magnesium, and zinc — more nutrient-dense per calorie than almost any other snack food available.',
  },
  {
    icon: '🧠',
    title: 'Brain & Heart Health',
    text: "The omega-3s in walnuts, the antioxidants in almonds, and the flavonoids in dates have been scientifically shown to support cognitive function and cardiovascular health when eaten regularly.",
  },
  {
    icon: '🌍',
    title: 'Global Origins',
    text: "Our pistachios come from Iran's Kerman province, almonds from California's Central Valley, and Medjool dates from Morocco's Draa Valley — each region provides the ideal climate for its crop.",
  },
  {
    icon: '🤝',
    title: 'Farmer First',
    text: 'We work directly with 200+ farming families across 12 countries. Fair prices, long-term relationships, and sustainable farming practices are at the core of how we do business.',
  },
];

const stats = [
  { value: '200+', label: 'Farm Partners' },
  { value: '12', label: 'Countries' },
  { value: '50K+', label: 'Customers' },
  { value: '100%', label: 'Natural' },
];

const nutritionFacts = [
  { name: 'Cashews', protein: '18g', fat: '44g', fiber: '3g', cal: '553' },
  { name: 'Almonds', protein: '21g', fat: '50g', fiber: '12g', cal: '579' },
  { name: 'Pistachios', protein: '20g', fat: '45g', fiber: '10g', cal: '560' },
  { name: 'Dates', protein: '2g', fat: '0.4g', fiber: '8g', cal: '277' },
  { name: 'Apricots', protein: '3g', fat: '0.5g', fiber: '7g', cal: '241' },
];

function AboutPage() {
  const navigate = useNavigate();

  return (
    <div className="page-wrapper">

      {/* Hero */}
      <div className="about__hero">
        <div className="about__hero-inner">
          <p className="section-eyebrow" style={{ color: 'var(--green-300)' }}>
            Our Story
          </p>
          <h1 className="about__hero-title">
            From Ancient Orchards<br />to Your Table
          </h1>
          <p className="about__hero-desc">
            For millennia, civilisations have treasured dry fruits for their concentrated nutrition,
            long shelf life, and extraordinary flavours. We bring that ancient wisdom to your
            modern kitchen — with full transparency about sourcing.
          </p>
        </div>
      </div>

      {/* Info cards */}
      <div className="section-container">
        <p className="section-eyebrow">Did You Know?</p>
        <h2 className="section-title">The Journey of Dry Fruits</h2>
        <p className="section-subtitle">
          From tree to table — here's everything that goes into your favourite snack
        </p>

        <div className="about__cards-grid">
          {infoCards.map(card => (
            <div key={card.title} className="about__card">
              <div className="about__card-icon">{card.icon}</div>
              <h3 className="about__card-title">{card.title}</h3>
              <p className="about__card-text">{card.text}</p>
            </div>
          ))}
        </div>
      </div>

      {/* Stats banner */}
      {/* <div className="about__stats-banner">
        <div className="about__stats-inner">
          <div className="about__stats-text">
            <p className="section-eyebrow" style={{ color: 'var(--green-300)' }}>
              By the Numbers
            </p>
            <h2 className="about__stats-title">Why NutriNest?</h2>
            <p className="about__stats-desc">
              Our quality certification process ensures every batch is tested for freshness,
              moisture content, and purity before it reaches your home. No compromises.
            </p>
          </div>
          <div className="about__stats-grid">
            {stats.map(s => (
              <div key={s.label} className="about__stat-box">
                <div className="about__stat-val">{s.value}</div>
                <div className="about__stat-label">{s.label}</div>
              </div>
            ))}
          </div>
        </div>
      </div> */}

      {/* Nutrition table */}
      <div className="section-container">
        <p className="section-eyebrow">Nutrition Facts</p>
        <h2 className="section-title">What's Inside Every Pack?</h2>
        <p className="section-subtitle">Nutritional values per 100g serving</p>

        <div className="about__nutrition-table-wrap">
          <table className="about__nutrition-table">
            <thead>
              <tr>
                <th>Product</th>
                <th>Protein</th>
                <th>Total Fat</th>
                <th>Dietary Fiber</th>
                <th>Calories</th>
              </tr>
            </thead>
            <tbody>
              {nutritionFacts.map(row => (
                <tr key={row.name}>
                  <td className="about__nutrition-name">{row.name}</td>
                  <td>{row.protein}</td>
                  <td>{row.fat}</td>
                  <td>{row.fiber}</td>
                  <td>{row.cal} kcal</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* CTA */}
      <div className="about__cta-section">
        <div className="about__cta-inner">
          <h2 className="about__cta-title">
            Ready to Start Your<br />Healthy Journey?
          </h2>
          <p className="about__cta-sub">
            Browse our full collection and experience the Nutresa difference
          </p>
          <button
            className="about__cta-btn"
            onClick={() => navigate('/shop')}
          >
            Shop All Products →
          </button>
        </div>
      </div>

      <Footer />
    </div>
  );
}

export default AboutPage;
