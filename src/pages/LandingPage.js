import React from 'react';
import { useNavigate } from 'react-router-dom';
import '../styles/LandingPage.css';

function LandingPage() {
  const navigate = useNavigate();

  return (
    <div className="landing-page">
      {/* Navigation Bar */}
      <nav className="navbar">
        <div className="nav-logo">Vision Board</div>
        <div className="nav-buttons">
          <button className="login-btn" onClick={() => navigate('/login')}>
            Log In
          </button>
          <button className="signup-btn" onClick={() => navigate('/signup')}>
            Sign Up
          </button>
        </div>
      </nav>

      {/* Logo */}
      <div className="logo">
        <span className="letter letter-v">V</span>
        <span className="letter letter-i1">i</span>
        <span className="letter letter-s">s</span>
        <span className="letter letter-i2">i</span>
        <span className="letter letter-o">o</span>
        <span className="letter letter-n">n</span>
        <br />
        <span className="letter letter-b">B</span>
        <span className="letter letter-o2">o</span>
        <span className="letter letter-a">a</span>
        <span className="letter letter-r">r</span>
        <span className="letter letter-d">d</span>
      </div>

      {/* Decorative stickers around logo */}
      <div className="star star-1">⭐</div>
      <div className="star star-2">⭐</div>
      <div className="heart heart-1">❤️</div>
      <div className="circle circle-1"></div>
      <div className="sparkle sparkle-1">✨</div>

      {/* Tagline */}
      <p className="tagline">Create your dream life collage ✨</p>

      {/* CTA Button */}
      <button className="cta-button" onClick={() => navigate('/signup')}>
        manifest
        <span className="button-sparkle">⭐</span>
      </button>

      {/* How it works section */}
      <h2 className="section-title">How it works</h2>

      <div className="feature-cards">
        <div className="feature-card card-1">
          <div className="card-image">🔍</div>
          <h3 className="card-title">Search Images</h3>
          <p className="card-description">Find inspiration from thousands of images</p>
        </div>

        <div className="feature-card card-2">
          <div className="card-image">✨</div>
          <h3 className="card-title">Decorate & Collage</h3>
          <p className="card-description">Arrange, rotate, and style your vision board</p>
        </div>

        <div className="feature-card card-3">
          <div className="card-image">📱</div>
          <h3 className="card-title">Export Wallpaper</h3>
          <p className="card-description">Download in perfect sizes for all devices</p>
        </div>
      </div>

      {/* Background decorations */}
      <div className="bg-star bg-star-1">⭐</div>
      <div className="bg-star bg-star-2">⭐</div>
      <div className="bg-heart bg-heart-1">❤️</div>
      <div className="bg-circle bg-circle-1"></div>
    </div>
  );
}

export default LandingPage;