import React from 'react';
import { Link } from 'react-router-dom';
import { BrandLogo, PhoneIcon, MapPinIcon } from './Icons';

const Footer = () => {
  return (
    <footer className="footer">
      <div className="container footer-grid">
        <div className="footer-brand-col">
          <div className="footer-logo">
            <BrandLogo size={40} />
            <div className="logo-text">
              <span className="brand-name">POOJITHA REDDY</span>
              <span className="brand-sub">ELECTRICALS</span>
            </div>
          </div>
          <p className="footer-desc">
            Professional and reliable electrical, industrial, plumbing, and welding services managed by V. Vinay Kumar Reddy. Serving residential and industrial properties with premium workmanship.
          </p>
        </div>

        <div className="footer-links-col">
          <h3>Services</h3>
          <ul>
            <li>All Electrical Works</li>
            <li>Industrial Works</li>
            <li>Plumbing Works</li>
            <li>Welding Works</li>
            <li>House Wiring</li>
          </ul>
        </div>

        <div className="footer-contact-col">
          <h3>Contact Info</h3>
          <div className="footer-contact-item">
            <PhoneIcon size={16} className="contact-icon-cyan" />
            <div>
              <p className="contact-label">Call Handyman:</p>
              <a href="tel:8498870697" className="contact-val">84988 70697</a>
            </div>
          </div>
          <div className="footer-contact-item">
            <MapPinIcon size={16} className="contact-icon-purple" />
            <div>
              <p className="contact-label">Address:</p>
              <p className="contact-val">2-61, Nallaballe, Muddanur, YSR Kadapa, Andhra Pradesh</p>
            </div>
          </div>
        </div>
      </div>
      <div className="footer-bottom">
        <div className="container footer-bottom-flex">
          <p>&copy; {new Date().getFullYear()} Poojitha Reddy Electricals. All rights reserved.</p>
          <div className="footer-bottom-links">
            <Link to="/admin-login" className="footer-admin-link">Admin Portal</Link>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
