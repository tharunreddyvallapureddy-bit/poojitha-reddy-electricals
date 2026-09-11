import React, { useState } from 'react';
import { PhoneIcon, MailIcon, MapPinIcon } from './Icons';

const Contact = ({ API_URL }) => {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    subject: '',
    message: '',
  });

  const [loading, setLoading] = useState(false);
  const [status, setStatus] = useState({ text: '', type: '' });

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setStatus({ text: '', type: '' });
    setLoading(true);

    if (!formData.name || !formData.email || !formData.phone || !formData.message) {
      setStatus({ text: 'Please fill in all required fields.', type: 'danger' });
      setLoading(false);
      return;
    }

    try {
      const response = await fetch(`${API_URL}/api/messages`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(formData),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || 'Failed to send message.');
      }

      setStatus({
        text: 'Your query has been sent successfully. We will get back to you shortly!',
        type: 'success',
      });

      // Sync message to Firebase Firestore
      try {
        const { doc, setDoc } = await import('firebase/firestore');
        const { db } = await import('../firebase');
        const msgId = 'msg_' + Date.now();
        await setDoc(doc(db, 'messages', msgId), {
          ...formData,
          createdAt: new Date().toISOString()
        });
      } catch (fbErr) {
        console.warn('Firebase contact sync note:', fbErr);
      }

      setFormData({
        name: '',
        email: '',
        phone: '',
        subject: '',
        message: '',
      });
    } catch (error) {
      setStatus({ text: error.message, type: 'danger' });
    } finally {
      setLoading(false);
    }
  };

  return (
    <section id="contact" className="section bg-dark">
      <div className="container">
        <h2 className="section-title">Get In Touch</h2>
        <p className="section-subtitle">
          Have an inquiry about an industrial project, full house wiring, or general plumbing/welding work? Drop us a message or call directly!
        </p>

        <div className="grid-2">
          {/* Contact Details Column */}
          <div className="contact-info-col">
            <h3 className="sub-title" style={{ marginBottom: '24px' }}>Contact Information</h3>
            
            <div className="contact-cards-stack">
              <div className="contact-info-card glass-card hover-glow">
                <div className="contact-card-icon-circle">
                  <PhoneIcon size={24} className="text-cyan" />
                </div>
                <div className="contact-card-details">
                  <h4>Call Handyman</h4>
                  <a href="tel:8498870697" className="contact-card-value text-gradient">84988 70697</a>
                  <p className="contact-card-sub">Available: 8:00 AM - 8:00 PM (Daily)</p>
                </div>
              </div>

              <div className="contact-info-card glass-card hover-glow">
                <div className="contact-card-icon-circle">
                  <MailIcon size={24} className="text-purple" />
                </div>
                <div className="contact-card-details">
                  <h4>Online Inquiry</h4>
                  <span className="contact-card-value">Submit Contact Form</span>
                  <p className="contact-card-sub">We respond directly to your contact number</p>
                </div>
              </div>

              <div className="contact-info-card glass-card hover-glow">
                <div className="contact-card-icon-circle">
                  <MapPinIcon size={24} className="text-cyan" />
                </div>
                <div className="contact-card-details">
                  <h4>Service Location</h4>
                  <p className="contact-card-value">2-61, Nallaballe, Muddanur, YSR Kadapa, Andhra Pradesh</p>
                  <p className="contact-card-sub">Providing services in residential & industrial areas</p>
                </div>
              </div>
            </div>
          </div>

          {/* Contact Form Column */}
          <div className="contact-form-col">
            <div className="glass-card">
              <h3 className="sub-title" style={{ marginBottom: '16px' }}>Send Message</h3>

              {status.text && (
                <div className={`alert-box alert-${status.type}`} style={{ marginBottom: '20px' }}>
                  {status.text}
                </div>
              )}

              <form onSubmit={handleSubmit}>
                <div className="grid-2">
                  <div className="form-group">
                    <label className="form-label">Your Name <span className="required">*</span></label>
                    <input
                      type="text"
                      name="name"
                      value={formData.name}
                      onChange={handleChange}
                      className="form-input"
                      placeholder="e.g. Ramesh Babu"
                      required
                    />
                  </div>
                  <div className="form-group">
                    <label className="form-label">Your Phone <span className="required">*</span></label>
                    <input
                      type="tel"
                      name="phone"
                      value={formData.phone}
                      onChange={handleChange}
                      className="form-input"
                      placeholder="e.g. 84988 70697"
                      required
                    />
                  </div>
                </div>

                <div className="grid-2">
                  <div className="form-group">
                    <label className="form-label">Your Email <span className="required">*</span></label>
                    <input
                      type="email"
                      name="email"
                      value={formData.email}
                      onChange={handleChange}
                      className="form-input"
                      placeholder="e.g. ramesh@example.com"
                      required
                    />
                  </div>
                  <div className="form-group">
                    <label className="form-label">Subject</label>
                    <input
                      type="text"
                      name="subject"
                      value={formData.subject}
                      onChange={handleChange}
                      className="form-input"
                      placeholder="e.g. Rate quote, wiring query..."
                    />
                  </div>
                </div>

                <div className="form-group">
                  <label className="form-label">Message Details <span className="required">*</span></label>
                  <textarea
                    name="message"
                    value={formData.message}
                    onChange={handleChange}
                    className="form-textarea"
                    placeholder="Describe your work requirement in detail..."
                    required
                  ></textarea>
                </div>

                <button type="submit" className="btn btn-primary w-full" disabled={loading}>
                  {loading ? 'Sending Message...' : 'Send Message'}
                </button>
              </form>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default Contact;
