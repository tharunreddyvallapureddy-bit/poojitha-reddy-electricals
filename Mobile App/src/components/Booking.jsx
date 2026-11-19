import React, { useState, useEffect } from 'react';
import { useSearchParams, Link, Navigate } from 'react-router-dom';
import { 
  CalendarIcon, 
  UserIcon, 
  PhoneIcon, 
  ClipboardIcon, 
  CheckIcon, 
  MapPinIcon, 
  CrosshairIcon, 
  LoaderIcon 
} from './Icons';

const Booking = ({ user, API_URL }) => {
  const [searchParams] = useSearchParams();
  const serviceParam = searchParams.get('service') || '';

  const [formData, setFormData] = useState({
    customerName: '',
    customerPhone: '',
    serviceType: '',
    bookingDate: '',
    description: '',
    address: {
      street: '',
      landmark: '',
      villageTown: '',
      district: '',
      state: 'Andhra Pradesh',
      pincode: '',
      coordinates: null
    }
  });

  const [detectingLocation, setDetectingLocation] = useState(false);
  const [locationStatus, setLocationStatus] = useState({ type: '', text: '' });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [successBooking, setSuccessBooking] = useState(null);

  // If not logged in, immediately redirect to sign in / sign up page
  if (!user) {
    const serviceQuery = serviceParam ? `&service=${encodeURIComponent(serviceParam)}` : '';
    return <Navigate to={`/auth?redirect=book${serviceQuery}`} replace />;
  }

  // Auto fill details from logged in user and fetch fresh profile address
  useEffect(() => {
    setFormData((prev) => ({
      ...prev,
      customerName: user ? user.name : '',
      customerPhone: user ? user.phone : '',
      serviceType: serviceParam || prev.serviceType || 'All Electrical Works',
      address: {
        ...prev.address,
        street: user?.address?.street || prev.address.street || '',
        landmark: user?.address?.landmark || prev.address.landmark || '',
        villageTown: user?.address?.villageTown || prev.address.villageTown || '',
        district: user?.address?.district || prev.address.district || '',
        state: user?.address?.state || prev.address.state || 'Andhra Pradesh',
        pincode: user?.address?.pincode || prev.address.pincode || '',
      }
    }));

    const token = localStorage.getItem('userToken');
    if (token) {
      fetch(`${API_URL}/api/auth/user/profile`, {
        headers: { 'Authorization': `Bearer ${token}` }
      })
        .then((res) => res.json())
        .then((profile) => {
          if (profile && profile.address) {
            setFormData((prev) => ({
              ...prev,
              customerName: profile.name || prev.customerName,
              customerPhone: profile.phone || prev.customerPhone,
              address: {
                ...prev.address,
                street: profile.address.street || prev.address.street,
                landmark: profile.address.landmark || prev.address.landmark,
                villageTown: profile.address.villageTown || prev.address.villageTown,
                district: profile.address.district || prev.address.district,
                state: profile.address.state || prev.address.state,
                pincode: profile.address.pincode || prev.address.pincode,
              }
            }));
          }
        })
        .catch((err) => console.warn('Profile sync note:', err));
    }
  }, [user, serviceParam, API_URL]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleAddressChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      address: {
        ...prev.address,
        [name]: value
      }
    }));
  };

  // Browser Geolocation auto-detection with OpenStreetMap reverse geocoding
  const handleAutoDetectLocation = () => {
    if (!navigator.geolocation) {
      setLocationStatus({ type: 'danger', text: 'Geolocation is not supported by your browser.' });
      return;
    }

    setDetectingLocation(true);
    setLocationStatus({ type: 'info', text: 'Detecting GPS coordinates...' });

    navigator.geolocation.getCurrentPosition(
      async (position) => {
        const { latitude, longitude } = position.coords;
        setLocationStatus({ type: 'info', text: 'Resolving address from coordinates...' });

        try {
          const res = await fetch(
            `https://nominatim.openstreetmap.org/reverse?format=json&lat=${latitude}&lon=${longitude}&zoom=18&addressdetails=1`,
            { headers: { 'Accept-Language': 'en' } }
          );

          if (res.ok) {
            const geoData = await res.json();
            const addr = geoData.address || {};

            const roadName = [
              addr.house_number,
              addr.road || addr.suburb || addr.neighbourhood || addr.residential
            ].filter(Boolean).join(', ');

            const townName = addr.village || addr.town || addr.city || addr.suburb || addr.county || '';
            const districtName = addr.state_district || addr.county || addr.district || '';
            const stateName = addr.state || 'Andhra Pradesh';
            const pincodeVal = addr.postcode || '';

            setFormData((prev) => ({
              ...prev,
              address: {
                ...prev.address,
                street: roadName || prev.address.street || geoData.display_name?.split(',')[0] || '',
                villageTown: townName || prev.address.villageTown,
                district: districtName || prev.address.district,
                state: stateName || prev.address.state,
                pincode: pincodeVal || prev.address.pincode,
                coordinates: { lat: latitude, lng: longitude }
              }
            }));

            setLocationStatus({
              type: 'success',
              text: `📍 Location detected: ${townName ? townName + ', ' : ''}${stateName} (${latitude.toFixed(4)}, ${longitude.toFixed(4)})`
            });
          } else {
            setFormData((prev) => ({
              ...prev,
              address: {
                ...prev.address,
                coordinates: { lat: latitude, lng: longitude }
              }
            }));
            setLocationStatus({
              type: 'success',
              text: `📍 GPS Coordinates captured (${latitude.toFixed(4)}, ${longitude.toFixed(4)}). Please fill in street & landmark.`
            });
          }
        } catch (err) {
          setFormData((prev) => ({
            ...prev,
            address: {
              ...prev.address,
              coordinates: { lat: latitude, lng: longitude }
            }
          }));
          setLocationStatus({
            type: 'success',
            text: `📍 GPS Coordinates captured (${latitude.toFixed(4)}, ${longitude.toFixed(4)}). Please fill in street & landmark.`
          });
        } finally {
          setDetectingLocation(false);
        }
      },
      (geoErr) => {
        setDetectingLocation(false);
        let msg = 'Unable to retrieve your location.';
        if (geoErr.code === 1) {
          msg = 'Location permission was denied. Please allow location access or type your address manually.';
        } else if (geoErr.code === 2) {
          msg = 'Location information is unavailable. Please enter address manually.';
        } else if (geoErr.code === 3) {
          msg = 'Location request timed out. Please enter address manually.';
        }
        setLocationStatus({ type: 'danger', text: msg });
      },
      { enableHighAccuracy: true, timeout: 12000, maximumAge: 60000 }
    );
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    if (!formData.customerName || !formData.customerPhone || !formData.serviceType || !formData.bookingDate) {
      setError('Please fill in all required fields.');
      setLoading(false);
      return;
    }

    if (!formData.address.street || !formData.address.villageTown) {
      setError('Please provide your service address (Door No/Street and Village/Town) so our technician can reach your location.');
      setLoading(false);
      return;
    }

    try {
      const headers = {
        'Content-Type': 'application/json',
      };
      
      // If customer is logged in, attach JWT token
      const token = localStorage.getItem('userToken');
      if (token) {
        headers['Authorization'] = `Bearer ${token}`;
      }

      const response = await fetch(`${API_URL}/api/bookings`, {
        method: 'POST',
        headers,
        body: JSON.stringify(formData),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || 'Booking submission failed. Please try again.');
      }

      setSuccessBooking(data);

      // Sync booking to Firebase Firestore
      try {
        const { doc, setDoc } = await import('firebase/firestore');
        const { db } = await import('../firebase');
        await setDoc(doc(db, 'bookings', data.bookingCode || String(data._id || Date.now())), {
          ...data,
          createdAt: new Date().toISOString()
        });
      } catch (fbErr) {
        console.warn('Firebase booking sync note:', fbErr);
      }
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  if (successBooking) {
    return (
      <div className="section container max-w-600">
        <div className="glass-card text-center success-receipt">
          <div className="success-icon-circle floating-element">
            <CheckIcon size={40} className="text-success" />
          </div>
          <h2 className="success-title text-gradient">Booking Confirmed!</h2>
          <p className="success-msg">Your service request has been registered successfully.</p>

          <div className="booking-code-box">
            <span className="code-label">YOUR BOOKING TRACKING CODE</span>
            <div className="code-value">{successBooking.bookingCode}</div>
            <p className="code-tip">Save this code to track your service progress anytime!</p>
          </div>

          <div className="receipt-details">
            <div className="receipt-row">
              <span>Service Type:</span>
              <strong>{successBooking.serviceType}</strong>
            </div>
            <div className="receipt-row">
              <span>Customer:</span>
              <strong>{successBooking.customerName}</strong>
            </div>
            <div className="receipt-row">
              <span>Service Address:</span>
              <div style={{ textAlign: 'right', maxWidth: '65%' }}>
                <strong>
                  {[
                    successBooking.address?.street,
                    successBooking.address?.landmark ? `(${successBooking.address.landmark})` : '',
                    successBooking.address?.villageTown,
                    successBooking.address?.district,
                    successBooking.address?.pincode
                  ].filter(Boolean).join(', ') || 'Registered Address'}
                </strong>
                {successBooking.address?.coordinates?.lat && successBooking.address?.coordinates?.lng && (
                  <a 
                    href={`https://www.google.com/maps?q=${successBooking.address.coordinates.lat},${successBooking.address.coordinates.lng}`}
                    target="_blank" 
                    rel="noopener noreferrer"
                    style={{ display: 'block', fontSize: '0.8rem', color: 'var(--accent-cyan)', marginTop: '4px' }}
                  >
                    🗺️ View on Google Maps
                  </a>
                )}
              </div>
            </div>
            <div className="receipt-row">
              <span>Booking Date:</span>
              <strong>{new Date(successBooking.bookingDate).toLocaleDateString()}</strong>
            </div>
            <div className="receipt-row">
              <span>Current Status:</span>
              <span className="badge badge-pending">{successBooking.status}</span>
            </div>
          </div>

          <div className="receipt-actions">
            <Link to={`/track?code=${successBooking.bookingCode}`} className="btn btn-primary">
              Track Status Now
            </Link>
            {user ? (
              <Link to="/dashboard" className="btn btn-secondary">
                Go to Dashboard
              </Link>
            ) : (
              <Link to="/" className="btn btn-secondary">
                Back to Home
              </Link>
            )}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="section container max-w-700">
      <div className="glass-card">
        <h2 className="section-title text-gradient" style={{ marginBottom: '10px' }}>Book a Handyman Service</h2>
        <p className="text-center text-secondary" style={{ marginBottom: '32px' }}>
          Schedule a visit by filling out the details below. We will confirm your request shortly.
        </p>

        {error && <div className="alert-box alert-danger">{error}</div>}

        <form onSubmit={handleSubmit} className="booking-form">
          <div className="grid-2">
            <div className="form-group">
              <label className="form-label">
                <UserIcon size={14} /> Full Name <span className="required">*</span>
              </label>
              <input
                type="text"
                name="customerName"
                value={formData.customerName}
                onChange={handleChange}
                className="form-input"
                placeholder="e.g. V. Vinay Kumar"
                required
              />
            </div>

            <div className="form-group">
              <label className="form-label">
                <PhoneIcon size={14} /> Contact Phone <span className="required">*</span>
              </label>
              <input
                type="tel"
                name="customerPhone"
                value={formData.customerPhone}
                onChange={handleChange}
                className="form-input"
                placeholder="e.g. 84988 70697"
                required
              />
            </div>
          </div>

          <div className="grid-2">
            <div className="form-group">
              <label className="form-label">Service Category <span className="required">*</span></label>
              <select
                name="serviceType"
                value={formData.serviceType}
                onChange={handleChange}
                className="form-select"
                required
              >
                <option value="All Electrical Works">All Electrical Works</option>
                <option value="Industrial Works">Industrial Works</option>
                <option value="Plumbing Works">Plumbing Works</option>
                <option value="Welding Works">Welding Works</option>
                <option value="House Wiring">House Wiring</option>
              </select>
            </div>

            <div className="form-group">
              <label className="form-label">
                <CalendarIcon size={14} /> Preferred Visit Date <span className="required">*</span>
              </label>
              <div className="date-input-wrapper">
                <input
                  type="date"
                  name="bookingDate"
                  value={formData.bookingDate}
                  onChange={handleChange}
                  className="form-input custom-date-input"
                  required
                  min={new Date().toISOString().split('T')[0]} // Block past dates
                  onClick={(e) => {
                    try {
                      if (e.target.showPicker) e.target.showPicker();
                    } catch (err) {}
                  }}
                />
                <span className="date-picker-custom-icon" aria-hidden="true">
                  <CalendarIcon size={18} />
                </span>
              </div>
            </div>
          </div>

          {/* Service Address Section with Geolocation Auto-Detection */}
          <div className="booking-address-section">
            <div className="address-section-header">
              <div className="address-header-title">
                <MapPinIcon size={18} className="text-cyan" />
                <span className="address-title-text">Service Address <span className="text-muted">(Where Service is Required)</span> <span className="required">*</span></span>
              </div>
              <button
                type="button"
                onClick={handleAutoDetectLocation}
                disabled={detectingLocation}
                className="btn-autodetect-location"
                title="Auto-detect current GPS address"
              >
                {detectingLocation ? (
                  <LoaderIcon size={14} className="animate-spin" />
                ) : (
                  <CrosshairIcon size={14} />
                )}
                <span>{detectingLocation ? 'Detecting Location...' : 'Auto-Detect Location'}</span>
              </button>
            </div>

            {locationStatus.text && (
              <div className={`location-status-badge badge-${locationStatus.type}`}>
                {locationStatus.text}
              </div>
            )}

            <div className="address-fields-grid">
              <div className="form-group full-span">
                <label className="form-label">
                  House / Door No & Street <span className="required">*</span>
                </label>
                <input
                  type="text"
                  name="street"
                  placeholder="e.g. 2-61, Main Street / Near Water Tank"
                  value={formData.address.street}
                  onChange={handleAddressChange}
                  className="form-input"
                  required
                />
              </div>

              <div className="form-group">
                <label className="form-label">Landmark</label>
                <input
                  type="text"
                  name="landmark"
                  placeholder="e.g. Opposite Post Office / Bus Stand"
                  value={formData.address.landmark}
                  onChange={handleAddressChange}
                  className="form-input"
                />
              </div>

              <div className="form-group">
                <label className="form-label">
                  Village / Town <span className="required">*</span>
                </label>
                <input
                  type="text"
                  name="villageTown"
                  placeholder="e.g. Nallaballe / Muddanur"
                  value={formData.address.villageTown}
                  onChange={handleAddressChange}
                  className="form-input"
                  required
                />
              </div>

              <div className="form-group">
                <label className="form-label">District</label>
                <input
                  type="text"
                  name="district"
                  placeholder="e.g. YSR Kadapa"
                  value={formData.address.district}
                  onChange={handleAddressChange}
                  className="form-input"
                />
              </div>

              <div className="form-group">
                <label className="form-label">State</label>
                <input
                  type="text"
                  name="state"
                  value={formData.address.state}
                  onChange={handleAddressChange}
                  className="form-input"
                />
              </div>

              <div className="form-group">
                <label className="form-label">Pincode</label>
                <input
                  type="text"
                  name="pincode"
                  placeholder="e.g. 516380"
                  value={formData.address.pincode}
                  onChange={handleAddressChange}
                  className="form-input"
                />
              </div>
            </div>

            {formData.address.coordinates && (
              <div className="coords-detected-pill">
                📍 GPS Coordinates attached: ({formData.address.coordinates.lat?.toFixed(5)}, {formData.address.coordinates.lng?.toFixed(5)})
              </div>
            )}
          </div>

          <div className="form-group">
            <label className="form-label">Description of Issue / Work details</label>
            <textarea
              name="description"
              value={formData.description}
              onChange={handleChange}
              className="form-textarea"
              placeholder="Describe what needs to be fixed or installed (e.g. Leak in bathroom tap, fitting 3 new lights in hall, industrial control panel wiring check...)"
            ></textarea>
          </div>

          <div className="booking-auth-tip">
            👤 <strong>Booking as:</strong> {user?.name} ({user?.phone}) — This request will be saved directly to your customer account dashboard!
          </div>

          <button type="submit" className="btn btn-primary w-full" disabled={loading}>
            {loading ? 'Submitting Request...' : 'Confirm & Request Booking'}
          </button>
        </form>
      </div>
    </div>
  );
};

export default Booking;
