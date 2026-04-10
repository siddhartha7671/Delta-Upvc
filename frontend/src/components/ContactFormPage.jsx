import React, { useState } from 'react';
import styled from 'styled-components';
import Header from './Header';
import AnimatedButton from './AnimatedButton';

const WindowIcon = ({ size = 24, className }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" className={className} xmlns="http://www.w3.org/2000/svg">
    <rect x="3" y="3" width="18" height="18" rx="2" stroke="currentColor" strokeWidth="2" strokeLinejoin="round"/>
    <path d="M3 9H21" stroke="currentColor" strokeWidth="2"/>
    <path d="M9 3V21" stroke="currentColor" strokeWidth="2"/>
  </svg>
);

import { API_BASE_URL } from '../apiConfig';

const ContactFormPage = ({ onBack, onPortalNav }) => {
  const [showSuccess, setShowSuccess] = useState(false);
  const [phone, setPhone] = useState('');

  const handlePhoneChange = (e) => {
    const value = e.target.value.replace(/\D/g, '').slice(0, 10);
    setPhone(value);
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    const data = {
      name: e.target.name.value,
      phone: e.target.phone.value,
      email: e.target.email.value,
      interest: "Contact Page Inquiry"
    };
    fetch(`${API_BASE_URL}/contact`, {
      method: 'POST',
      headers: {'Content-Type': 'application/json'},
      body: JSON.stringify(data)
    })
    .then(res => res.json())
    .then(res => {
      if (res.status === 'success') {
        setShowSuccess(true);
        setPhone('');
        e.target.reset();
      } else {
        alert(res.message || "Something went wrong. Please try again.");
      }
    })
    .catch(err => {
      alert("Network error. Please check your connection.");
    });
  };

  return (
    <StyledWrapper>
      {showSuccess && (
        <SuccessOverlay onClick={() => onBack()}>
          <StyledCard onClick={e => e.stopPropagation()}>
            <div className="notifications-container">
              <div className="success">
                <div className="flex">
                  <div className="flex-shrink-0">
                    <svg aria-hidden="true" fill="currentColor" viewBox="0 0 20 20" xmlns="http://www.w3.org/2000/svg" className="success-svg">
                      <path clipRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" fillRule="evenodd" />
                    </svg>
                  </div>
                  <div className="success-prompt-wrap">
                    <p className="success-prompt-heading">
                      Success Submitted!
                      <span className="checkmark">✓</span>
                    </p>
                    <div className="success-prompt-prompt">
                      <p>
                        Our team will reach out to you shortly. Thank you for choosing Delta UPVC Windows.
                      </p>
                    </div>
                    <div className="success-button-container">
                      <button className="success-button-main" type="button" onClick={() => onBack()}>Back to Home</button>
                      <button className="success-button-secondary" type="button" onClick={() => setShowSuccess(false)}>
                        Dismiss
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </StyledCard>
        </SuccessOverlay>
      )}
      <Header onHomeNav={onBack} onPortalNav={onPortalNav} activeNav="contact" />
      
      {/* OUTSIDE FLOATING ICONS */}
      <div className="outside-icons">
        {[...Array(8)].map((_, i) => (
          <WindowIcon key={i} size={30 + i * 15} className={`bg-icon bg-icon-${i}`} />
        ))}
      </div>

      <div className="contact-page-container">
        <div className="contact-card">
          <div className="contact-info">
            {/* INSIDE POPPING ICONS */}
            <div className="inside-icons">
              {[...Array(4)].map((_, i) => (
                <WindowIcon key={i} size={40 + i * 20} className={`pop-icon pop-icon-${i}`} />
              ))}
            </div>

            <div className="info-content">
              <h1>Get in Touch</h1>
              <p>Our experts are ready to help you with your next UPVC project.</p>
              <div className="info-item">
                <strong>Location:</strong> Corporate Office, Delta Windows
              </div>
              <div className="info-item">
                <strong>Email:</strong> deltaupvc2025@gmail.com
              </div>
              <div className="info-item">
                <strong>Phone:</strong> 9515244667
              </div>
              <div className="info-item">
                <strong>Hours:</strong> Mon - Sat: 9:00 AM - 6:00 PM
              </div>
            </div>
          </div>
          
          <div className="form-column">
            <form className="contact-form" onSubmit={handleSubmit}>
              <h2>Send an Inquiry</h2>
              <div className="input-group-row">
                <input type="text" name="name" placeholder="Full Name" required />
                <input 
                  type="text" 
                  name="phone" 
                  placeholder="Phone Number" 
                  required 
                  value={phone}
                  onChange={handlePhoneChange}
                  pattern="[0-9]{10}"
                  title="Phone number must be exactly 10 digits"
                />
              </div>
              <input type="email" name="email" placeholder="Email Address (Optional)" />
              <textarea name="message" placeholder="How can we help? (Optional)" rows="4"></textarea>
              <div style={{ marginTop: '1.5rem' }}>
                 <AnimatedButton text="SUBMIT INQUIRY" />
              </div>
            </form>
          </div>
        </div>
      </div>
      
      <footer className="footer">
        <p>&copy; 2026 Delta UPVC Windows. All rights reserved.</p>
      </footer>
    </StyledWrapper>
  );
};

const SuccessOverlay = styled.div`
  position: fixed;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  background: rgba(0, 0, 0, 0.4);
  backdrop-filter: blur(4px);
  display: flex;
  justify-content: center;
  align-items: center;
  z-index: 10000;
  animation: fadeIn 0.3s ease-out;

  @keyframes fadeIn {
     from { opacity: 0; }
     to { opacity: 1; }
  }
`;

const StyledCard = styled.div`
  .notifications-container {
    width: 320px;
    height: auto;
    font-size: 0.875rem;
    line-height: 1.25rem;
    display: flex;
    flex-direction: column;
    gap: 1rem;
    animation: slideIn 0.4s ease-out;
  }

  .flex {
    display: flex;
  }

  .flex-shrink-0 {
    flex-shrink: 0;
  }

  .success {
    padding: 1.25rem;
    border-radius: 0.75rem;
    background-color: rgb(240 253 244);
    box-shadow: 0 4px 15px rgba(0, 0, 0, 0.1);
    transition: all 0.3s ease;
    border: 1px solid rgba(74, 222, 128, 0.2);
  }

  .success:hover {
    transform: translateY(-2px);
    box-shadow: 0 8px 25px rgba(0, 0, 0, 0.1);
  }

  .success-svg {
    color: rgb(74 222 128);
    width: 1.5rem;
    height: 1.5rem;
    filter: drop-shadow(0 0 8px rgba(74, 222, 128, 0.4));
    animation: pulse 2s infinite;
  }

  .success-prompt-wrap {
    margin-left: 1rem;
  }

  .success-prompt-heading {
    font-weight: 700;
    color: rgb(22 101 52);
    font-size: 1.05rem;
    display: flex;
    align-items: center;
    gap: 0.5rem;
  }

  .checkmark {
    color: rgb(74 222 128);
    animation: scaleCheck 0.3s ease-in-out;
  }

  .success-prompt-prompt {
    margin-top: 0.75rem;
    color: rgb(21 128 61);
    line-height: 1.5;
  }

  .success-button-container {
    display: flex;
    margin-top: 1rem;
    gap: 0.75rem;
  }

  .success-button-main {
    padding: 0.5rem 1rem;
    background-color: rgb(22 101 52);
    color: white;
    font-size: 0.875rem;
    font-weight: 600;
    border-radius: 0.5rem;
    border: none;
    transition: all 0.2s ease;
    cursor: pointer;
    box-shadow: 0 2px 8px rgba(22, 101, 52, 0.2);
  }

  .success-button-main:hover {
    background-color: rgb(21 128 61);
    transform: translateY(-1px);
    box-shadow: 0 4px 12px rgba(22, 101, 52, 0.3);
  }

  .success-button-secondary {
    padding: 0.5rem 1rem;
    background-color: rgb(240 253 244);
    color: rgb(22 101 52);
    font-size: 0.875rem;
    font-weight: 600;
    border-radius: 0.5rem;
    border: 1px solid rgba(22, 101, 52, 0.2);
    transition: all 0.2s ease;
    cursor: pointer;
  }

  .success-button-secondary:hover {
    background-color: rgb(220, 243, 234);
    border-color: rgba(22, 101, 52, 0.3);
    transform: translateY(-1px);
  }

  @keyframes slideIn {
    from {
      opacity: 0;
      transform: translateY(10px);
    }
    to {
      opacity: 1;
      transform: translateY(0);
    }
  }

  @keyframes pulse {
    0% {
      transform: scale(1);
    }
    50% {
      transform: scale(1.1);
    }
    100% { transform: scale(1); }
  }

  @keyframes scaleCheck {
    0% { transform: scale(0); }
    50% { transform: scale(1.2); }
    100% { transform: scale(1); }
  }

  .success-button-main:active,
  .success-button-secondary:active {
    transform: scale(0.95);
  }
`;

const StyledWrapper = styled.div`
  min-height: 100vh;
  background: #f8fafc;
  display: flex;
  flex-direction: column;
  position: relative;
  overflow: hidden;

  /* OUTSIDE BG ICONS */
  .outside-icons {
    position: absolute;
    inset: 0;
    pointer-events: none;
    z-index: 0;
  }

  @keyframes floatSlow {
    0%, 100% { transform: translate(0, 0) rotate(0deg); }
    33% { transform: translate(20px, -20px) rotate(5deg); }
    66% { transform: translate(-10px, 20px) rotate(-5deg); }
  }

  .bg-icon {
    position: absolute;
    color: #10b981;
    opacity: 0.05;
    animation: floatSlow 8s ease-in-out infinite;
  }

  .bg-icon-0 { top: 10%; left: 5%; animation-delay: 0s; }
  .bg-icon-1 { top: 70%; left: 10%; animation-delay: 1s; }
  .bg-icon-2 { top: 40%; left: 80%; animation-delay: 2s; }
  .bg-icon-3 { top: 85%; left: 85%; animation-delay: 3s; }
  .bg-icon-4 { top: 15%; left: 70%; animation-delay: 4s; }
  .bg-icon-5 { top: 50%; left: 20%; animation-delay: 5s; }
  .bg-icon-6 { top: 30%; right: 5%; animation-delay: 6s; }
  .bg-icon-7 { bottom: 5%; left: 40%; animation-delay: 7s; }

  .contact-page-container {
    flex: 1;
    display: flex;
    justify-content: center;
    align-items: center;
    padding: 8rem 5% 4rem;
    position: relative;
    z-index: 1;
  }

  @keyframes cardPopup {
    0% { transform: scale(0.6) translateY(100px); opacity: 0; }
    70% { transform: scale(1.08) translateY(-10px); opacity: 1; }
    100% { transform: scale(1) translateY(0); opacity: 1; }
  }

  .contact-card {
    display: flex;
    width: 100%;
    max-width: 650px;
    aspect-ratio: 1 / 1;
    background: white;
    border-radius: 2rem;
    overflow: hidden;
    box-shadow: 0 40px 80px rgba(0, 0, 0, 0.1);
    position: relative;
    z-index: 2;
    animation: cardPopup 0.8s cubic-bezier(0.175, 0.885, 0.32, 1.275) backwards;
  }

  .contact-info {
    flex: 1;
    background: #10b981;
    padding: 2.5rem;
    color: white;
    display: flex;
    flex-direction: column;
    justify-content: center;
    text-align: left;
    position: relative;
    overflow: hidden;
  }

  /* INSIDE POP ICONS */
  .inside-icons {
    position: absolute;
    inset: 0;
    pointer-events: none;
    z-index: 0;
  }

  @keyframes iconPopIn {
    0% { transform: scale(0) rotate(-15deg); opacity: 0; }
    60% { transform: scale(1.1) rotate(10deg); opacity: 0.15; }
    100% { transform: scale(1) rotate(0deg); opacity: 0.1; }
  }

  .pop-icon {
    position: absolute;
    color: white;
    opacity: 0;
    animation: iconPopIn 1s cubic-bezier(0.175, 0.885, 0.32, 1.275) forwards;
  }

  .pop-icon-0 { top: 10%; right: 10%; animation-delay: 0.2s; }
  .pop-icon-1 { bottom: 10%; left: 10%; animation-delay: 0.5s; }
  .pop-icon-2 { top: 40%; right: -10%; animation-delay: 0.8s; }
  .pop-icon-3 { bottom: 30%; right: 20%; animation-delay: 1.1s; }

  .info-content {
    position: relative;
    z-index: 1;
  }

  .contact-info h1 {
    font-size: 1.8rem;
    margin-bottom: 1.2rem;
    color: white;
    text-align: left;
  }

  .contact-info p {
    text-align: left;
    margin-bottom: 2rem;
    line-height: 1.5;
    opacity: 0.9;
  }

  .info-item {
    margin-bottom: 0.8rem;
    font-size: 0.95rem;
    opacity: 0.9;
    text-align: left;
  }

  .form-column {
    flex: 1.2;
    padding: 2.5rem;
    display: flex;
    flex-direction: column;
    justify-content: center;
    background: white;
    position: relative;
    z-index: 1;
  }

  .contact-form h2 {
    font-size: 1.4rem;
    color: #064e3b;
    margin-bottom: 1.5rem;
    text-align: left;
  }

  .input-group-row {
    display: flex;
    flex-direction: column;
    gap: 0.8rem;
  }

  .contact-form input, .contact-form textarea {
    width: 100%;
    padding: 0.8rem 1rem;
    border-radius: 0.75rem;
    border: 2px solid #f1f5f9;
    background: #f8fafc;
    font-size: 0.9rem;
    color: #334155;
    margin-bottom: 0.8rem;
    transition: all 0.3s ease;
  }

  .contact-form input:focus, .contact-form textarea:focus {
    outline: none;
    border-color: #10b981;
    background: white;
    box-shadow: 0 0 0 4px rgba(16, 185, 129, 0.1);
  }

  @media (max-width: 1024px) {
    .contact-card { 
      aspect-ratio: auto;
      flex-direction: column; 
    }
    .contact-info, .form-column { padding: 3rem 2rem; }
    .pop-icon { display: none; }
  }
`;

export default ContactFormPage;
