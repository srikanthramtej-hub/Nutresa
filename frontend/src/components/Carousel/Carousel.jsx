import React, { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import './Carousel.css';

// const slides = [
//   {
//     id: 1,
//     bgColor: '#1b4332',
//     emoji: '🌿',
//     eyebrow: 'NATURE\'S BEST',
//     title: 'Premium Dry Fruits\nFrom Nature',
//     description:
//       'Handpicked from the world\'s finest orchards and delivered fresh to your doorstep. Zero preservatives, 100% natural.',
//     ctaLabel: 'Shop Now',
//   },
//   {
//     id: 2,
//     bgColor: '#2d6a4f',
//     emoji: '🥜',
//     eyebrow: 'NEW ARRIVALS',
//     title: 'Cashews That Melt\nIn Your Mind',
//     description:
//       'Our new batch of premium cashews is here — rich, buttery, and absolutely divine. Limited stock available.',
//     ctaLabel: 'Explore Cashews',
//   },
//   {
//     id: 3,
//     bgColor: '#40916c',
//     emoji: '✨',
//     eyebrow: 'HEALTHY LIVING',
//     title: 'Fuel Your Day\nThe Natural Way',
//     description:
//       'Every nut and dried fruit in our collection is rich in nutrients with zero additives. Power your body right.',
//     ctaLabel: 'Discover More',
//   },
// ];

const slides = [
  {
    id: 1,
    image: '/images/banner1.jpeg',
    eyebrow: 'NATURE\'S BEST',
    title: 'Premium Dry Fruits\nFrom Nature',
    description:
      'Handpicked from the world\'s finest orchards and delivered fresh to your doorstep.',
    ctaLabel: 'Shop Now',
  },
]

function Carousel() {
  const navigate = useNavigate();
  const [activeIndex, setActiveIndex] = useState(0);
  const [isAnimating, setIsAnimating] = useState(false);

  const goToSlide = useCallback((index) => {
    if (isAnimating) return;
    setIsAnimating(true);
    setActiveIndex(index);
    setTimeout(() => setIsAnimating(false), 700);
  }, [isAnimating]);

  const goNext = useCallback(() => {
    goToSlide((activeIndex + 1) % slides.length);
  }, [activeIndex, goToSlide]);

  const goPrev = useCallback(() => {
    goToSlide((activeIndex - 1 + slides.length) % slides.length);
  }, [activeIndex, goToSlide]);

  useEffect(() => {
    const timer = setInterval(goNext, 4500);
    return () => clearInterval(timer);
  }, [goNext]);

  return (
  <div className="carousel">
    {slides.map((slide, index) => (
      <div
        key={slide.id}
        className={`carousel__slide ${
          index === activeIndex ? 'carousel__slide--active' : ''
        }`}
        style={{
          backgroundImage: `url(${slide.image})`,
          backgroundSize: 'cover',
          backgroundPosition: 'center',
          backgroundRepeat: 'no-repeat',
        }}
      >
        <div className="carousel__overlay">
          <div className="carousel__content">
            <span className="carousel__eyebrow">
              {slide.eyebrow}
            </span>

            <h1 className="carousel__title">
              {slide.title.split('\n').map((line, i) => (
                <span key={i}>
                  {line}
                  {i < slide.title.split('\n').length - 1 && <br />}
                </span>
              ))}
            </h1>

            <p className="carousel__desc">
              {slide.description}
            </p>

            <button
              className="carousel__cta"
              onClick={() => navigate('/shop')}
            >
              {slide.ctaLabel} →
            </button>
          </div>
        </div>
      </div>
    ))}

    {/* Arrow navigation */}
    <button
      className="carousel__arrow carousel__arrow--prev"
      onClick={goPrev}
      aria-label="Previous slide"
    >
      ‹
    </button>

    <button
      className="carousel__arrow carousel__arrow--next"
      onClick={goNext}
      aria-label="Next slide"
    >
      ›
    </button>

    {/* Dot indicators */}
    <div className="carousel__dots">
      {slides.map((_, index) => (
        <button
          key={index}
          className={`carousel__dot ${
            index === activeIndex ? 'carousel__dot--active' : ''
          }`}
          onClick={() => goToSlide(index)}
          aria-label={`Go to slide ${index + 1}`}
        />
      ))}
    </div>

    {/* Counter */}
    <div className="carousel__counter">
      {activeIndex + 1} / {slides.length}
    </div>
  </div>
);
}
      export default Carousel;
