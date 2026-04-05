import React, { useState } from 'react';

export default function ProductCard({ product, onContactDealer }) {
  const [showContactModal, setShowContactModal] = useState(false);
  const [contactForm, setContactForm] = useState({
    email: '',
    phone: '',
    message: ''
  });

  const handleContactClick = () => {
    setShowContactModal(true);
  };

  const handleFormChange = (e) => {
    const { name, value } = e.target;
    setContactForm(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleSubmitContact = async () => {
    if (!contactForm.email || !contactForm.phone) {
      alert('Please enter email and phone');
      return;
    }

    try {
      await fetch('/api/send-product-inquiry', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          productId: product.id,
          customerEmail: contactForm.email,
          customerPhone: contactForm.phone,
          message: contactForm.message
        })
      });

      alert('Inquiry sent! Dealer will contact you soon.');
      setShowContactModal(false);
      setContactForm({ email: '', phone: '', message: '' });
    } catch (error) {
      console.error('Error sending inquiry:', error);
      alert('Failed to send inquiry');
    }
  };

  const getGoogleMapsUrl = () => {
    if (product.dealer_lat && product.dealer_lng) {
      return `https://maps.google.com/?q=${product.dealer_lat},${product.dealer_lng}`;
    }
    return `https://maps.google.com/?q=${encodeURIComponent(product.dealer_address || '')}`;
  };

  return (
    <div style={styles.container}>
      <div style={styles.card}>
        {/* Product Image */}
        <div style={styles.imageContainer}>
          {product.image ? (
            <img src={product.image} alt={product.name} style={styles.image} />
          ) : (
            <div style={styles.imagePlaceholder}>
              📦 {product.category}
            </div>
          )}
        </div>

        {/* Content */}
        <div style={styles.content}>
          {/* Dealer Info */}
          <div style={styles.dealerInfo}>
            <h3 style={styles.dealerName}>{product.business_name || 'Shop'}</h3>
            <p style={styles.address}>📍 {product.dealer_address || 'Location not set'}</p>
          </div>

          {/* Product Details */}
          <h2 style={styles.productName}>{product.name}</h2>
          <p style={styles.description}>{product.description}</p>
          
          <div style={styles.priceRow}>
            <span style={styles.price}>₹{product.price || '0'}</span>
            {product.rating && (
              <span style={styles.rating}>⭐ {product.rating}</span>
            )}
          </div>

          {/* Action Buttons */}
          <div style={styles.buttonGroup}>
            {/* Call Button */}
            <a
              href={`tel:${product.dealer_phone}`}
              style={{...styles.button, ...styles.callButton}}
            >
              📞 Call
            </a>

            {/* WhatsApp Button */}
            <a
              href={`https://wa.me/${product.dealer_phone.replace(/\D/g, '')}`}
              target="_blank"
              rel="noopener noreferrer"
              style={{...styles.button, ...styles.whatsappButton}}
            >
              💬 WhatsApp
            </a>

            {/* Directions Button */}
            <a
              href={getGoogleMapsUrl()}
              target="_blank"
              rel="noopener noreferrer"
              style={{...styles.button, ...styles.directionsButton}}
            >
              📍 Directions
            </a>

            {/* Contact Button */}
            <button
              onClick={handleContactClick}
              style={{...styles.button, ...styles.contactButton}}
            >
              ✉️ Inquire
            </button>
          </div>
        </div>
      </div>

      {/* Contact Modal */}
      {showContactModal && (
        <div style={styles.modalOverlay}>
          <div style={styles.modal}>
            <div style={styles.modalHeader}>
              <h3>Send Inquiry to {product.business_name}</h3>
              <button
                onClick={() => setShowContactModal(false)}
                style={styles.closeButton}
              >
                ✕
              </button>
            </div>

            <div style={styles.modalBody}>
              <div style={styles.formGroup}>
                <label style={styles.label}>Your Email</label>
                <input
                  type="email"
                  name="email"
                  value={contactForm.email}
                  onChange={handleFormChange}
                  placeholder="your.email@example.com"
                  style={styles.input}
                />
              </div>

              <div style={styles.formGroup}>
                <label style={styles.label}>Your Phone</label>
                <input
                  type="tel"
                  name="phone"
                  value={contactForm.phone}
                  onChange={handleFormChange}
                  placeholder="+91 12345 67890"
                  style={styles.input}
                />
              </div>

              <div style={styles.formGroup}>
                <label style={styles.label}>Message</label>
                <textarea
                  name="message"
                  value={contactForm.message}
                  onChange={handleFormChange}
                  placeholder="Tell the dealer about your interest..."
                  style={{...styles.input, ...styles.textarea}}
                  rows="4"
                />
              </div>

              <button
                onClick={handleSubmitContact}
                style={styles.submitButton}
              >
                Send Inquiry
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

const styles = {
  container: {
    flex: '1 1 calc(33.333% - 16px)',
    minWidth: '300px',
    margin: '8px'
  },
  card: {
    background: 'white',
    borderRadius: '12px',
    overflow: 'hidden',
    boxShadow: '0 2px 8px rgba(0,0,0,0.1)',
    transition: 'all 0.3s ease',
    cursor: 'pointer',
    ':hover': {
      boxShadow: '0 8px 16px rgba(102, 126, 234, 0.2)',
      transform: 'translateY(-4px)'
    }
  },
  imageContainer: {
    width: '100%',
    height: '200px',
    background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    overflow: 'hidden'
  },
  image: {
    width: '100%',
    height: '100%',
    objectFit: 'cover'
  },
  imagePlaceholder: {
    fontSize: '32px',
    color: 'white',
    fontWeight: 'bold',
    textAlign: 'center'
  },
  content: {
    padding: '16px'
  },
  dealerInfo: {
    marginBottom: '12px',
    paddingBottom: '8px',
    borderBottom: '1px solid #eee'
  },
  dealerName: {
    margin: '0 0 4px 0',
    fontSize: '14px',
    fontWeight: '600',
    color: '#667eea'
  },
  address: {
    margin: '0',
    fontSize: '12px',
    color: '#999'
  },
  productName: {
    margin: '8px 0',
    fontSize: '16px',
    fontWeight: '700',
    color: '#333'
  },
  description: {
    margin: '8px 0',
    fontSize: '13px',
    color: '#666',
    lineHeight: '1.4'
  },
  priceRow: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    margin: '12px 0',
    paddingBottom: '8px',
    borderBottom: '1px solid #eee'
  },
  price: {
    fontSize: '18px',
    fontWeight: '700',
    color: '#764ba2'
  },
  rating: {
    fontSize: '12px',
    color: '#f39c12'
  },
  buttonGroup: {
    display: 'flex',
    gap: '6px',
    flexWrap: 'wrap',
    marginTop: '12px'
  },
  button: {
    flex: '1 1 calc(50% - 3px)',
    padding: '8px 12px',
    border: 'none',
    borderRadius: '6px',
    fontSize: '12px',
    fontWeight: '600',
    cursor: 'pointer',
    textAlign: 'center',
    textDecoration: 'none',
    transition: 'all 0.2s ease'
  },
  callButton: {
    background: '#2ecc71',
    color: 'white',
    ':hover': {
      background: '#27ae60'
    }
  },
  whatsappButton: {
    background: '#25d366',
    color: 'white',
    ':hover': {
      background: '#1abc9c'
    }
  },
  directionsButton: {
    background: '#3498db',
    color: 'white',
    ':hover': {
      background: '#2980b9'
    }
  },
  contactButton: {
    background: '#667eea',
    color: 'white',
    ':hover': {
      background: '#764ba2'
    }
  },
  
  // Modal Styles
  modalOverlay: {
    position: 'fixed',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    background: 'rgba(0,0,0,0.5)',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    zIndex: 1000
  },
  modal: {
    background: 'white',
    borderRadius: '12px',
    maxWidth: '500px',
    width: '90%',
    maxHeight: '90vh',
    overflow: 'auto',
    boxShadow: '0 10px 40px rgba(0,0,0,0.2)'
  },
  modalHeader: {
    padding: '20px',
    background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
    color: 'white',
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center'
  },
  closeButton: {
    background: 'none',
    border: 'none',
    color: 'white',
    fontSize: '24px',
    cursor: 'pointer',
    padding: '0',
    width: '32px',
    height: '32px',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center'
  },
  modalBody: {
    padding: '20px'
  },
  formGroup: {
    marginBottom: '16px'
  },
  label: {
    display: 'block',
    marginBottom: '6px',
    fontSize: '14px',
    fontWeight: '600',
    color: '#333'
  },
  input: {
    width: '100%',
    padding: '10px 12px',
    border: '1px solid #ddd',
    borderRadius: '6px',
    fontSize: '14px',
    fontFamily: 'inherit',
    boxSizing: 'border-box',
    ':focus': {
      outline: 'none',
      borderColor: '#667eea'
    }
  },
  textarea: {
    resize: 'vertical',
    fontFamily: 'inherit'
  },
  submitButton: {
    width: '100%',
    padding: '12px',
    background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
    color: 'white',
    border: 'none',
    borderRadius: '6px',
    fontSize: '14px',
    fontWeight: '600',
    cursor: 'pointer',
    marginTop: '12px'
  }
};
