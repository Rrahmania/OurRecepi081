// src/components/HeroCarousel.jsx
import React, { useState, useEffect } from 'react';
import './HeroCarousel.css';

const HeroCarousel = () => {
  // ✅ BENAR: Pakai URL gambar online
  const slides = [
    {
      id: 1,
      image: 'https://images.unsplash.com/photo-1546069901-ba9599a7e63c?w=1200&h=400&fit=crop',
      title: 'Salad Buah Segar',
      description: 'Nikmati kesegaran buah-buahan pilihan untuk hari yang ceria.'
    },
    {
      id: 2,
      image: 'data:image/jpeg;base64,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',
      title: 'Sayur Asem Jawa',
      description: 'Citarasa asam segar yang menggugah selera, cocok untuk makan siang.'
    },
    {
      id: 3,
      image: 'https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcTYTZbCEQPjMSxwHGorcPyxODdyLiD53z557Q&s',
      title: 'Ayam Bakar Madu',
      description: 'Ayam bakar dengan bumbu madu spesial, lezat dan empuk.'
    },
  ];

  const [currentSlide, setCurrentSlide] = useState(0);

  const nextSlide = () => {
    setCurrentSlide((prevSlide) =>
      prevSlide === slides.length - 1 ? 0 : prevSlide + 1
    );
  };

  const prevSlide = () => {
    setCurrentSlide((prevSlide) =>
      prevSlide === 0 ? slides.length - 1 : prevSlide - 1
    );
  };

  const goToSlide = (index) => {
    setCurrentSlide(index);
  };

  useEffect(() => {
    const autoSlide = setInterval(nextSlide, 5000);
    return () => clearInterval(autoSlide);
  }, [currentSlide]);

  return (
    <div className="hero-carousel-container">
      <div
        className="carousel-track"
        style={{ transform: `translateX(-${currentSlide * 100}%)` }}
      >
        {slides.map((slide, index) => (
          <div
            className={`carousel-slide ${index === currentSlide ? 'active' : ''}`}
            key={slide.id}
          >
            <img src={slide.image} alt={slide.title} />
            <div className="slide-content">
              <h2>{slide.title}</h2>
              <p>{slide.description}</p>
            </div>
          </div>
        ))}
      </div>

      <button className="carousel-control prev" onClick={prevSlide}>
        &#10094;
      </button>
      <button className="carousel-control next" onClick={nextSlide}>
        &#10095;
      </button>

      <div className="carousel-dots">
        {slides.map((_, index) => (
          <span
            key={index}
            className={`dot ${index === currentSlide ? 'active' : ''}`}
            onClick={() => goToSlide(index)}
          ></span>
        ))}
      </div>
    </div>
  );
};

export default HeroCarousel;