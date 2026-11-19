import React from 'react';
import { Link } from 'react-router-dom';
import { PhoneIcon, ZapIcon, ToolIcon } from './Icons';

const Hero = ({ user }) => {
  return (
    <section id="hero" className="hero-section">
      <div className="container hero-grid">
        <div className="hero-content">
          <div className="hero-badge floating-element">
            <ZapIcon size={16} className="text-cyan" /> Handyman Services
          </div>
          <h1 className="hero-title">
            POOJITHA REDDY <br />
            <span className="text-gradient">ELECTRICALS</span>
          </h1>
          <p className="hero-subtitle">
            Reliable handyman services managed by <strong>V. Vinay Kumar Reddy</strong>. Specializing in house wiring, industrial electrical works, welding, plumbing, and generic repairs.
          </p>

          <div className="hero-info-card glass-card">
            <div className="info-row">
              <span className="info-label">Owner & Handyman:</span>
              <span className="info-value">V. Vinay Kumar Reddy</span>
            </div>
            <div className="info-row">
              <span className="info-label">Contact Number:</span>
              <a href="tel:8498870697" className="info-value text-cyan highlight-phone">
                <PhoneIcon size={16} /> 84988 70697
              </a>
            </div>
            <div className="info-row">
              <span className="info-label">Service Area:</span>
              <span className="info-value">Residential & Industrial</span>
            </div>
          </div>

          <div className="hero-actions">
            <Link to={user ? "/book" : "/auth?redirect=book"} className="btn btn-primary btn-lg-glow">
              <ToolIcon size={18} /> Book a Service
            </Link>
            <Link to={user ? "/track" : "/auth?redirect=track"} className="btn btn-secondary">
              Track Booking Status
            </Link>
          </div>
        </div>

        {/* High-class Neon Hexagon Graphic Panel */}
        <div className="hero-graphic">
          <div className="hex-grid">
            <div className="hex-item hex-1 glowing-element">
              <div className="hex-inner">
                <ZapIcon size={36} className="hex-icon text-cyan" />
                <span>Electrical</span>
              </div>
            </div>
            <div className="hex-item hex-2 floating-element">
              <div className="hex-inner">
                <ToolIcon size={36} className="hex-icon text-purple" />
                <span>Handyman</span>
              </div>
            </div>
            <div className="hex-item hex-3">
              <div className="hex-inner">
                <span className="hex-badge-text">24/7 Support</span>
              </div>
            </div>
            <div className="hex-item hex-4 floating-element" style={{ animationDelay: '2s' }}>
              <div className="hex-inner">
                <div className="hex-stat">100%</div>
                <span>Safe Work</span>
              </div>
            </div>
          </div>
          <div className="graphic-glow-bg"></div>
        </div>
      </div>
    </section>
  );
};

export default Hero;
