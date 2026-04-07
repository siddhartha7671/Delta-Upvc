import React, { useState } from 'react';
import styled from 'styled-components';
import AnimatedButton from './AnimatedButton';

const WindowIcon = ({ size = 24, className }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" className={className} xmlns="http://www.w3.org/2000/svg">
    <rect x="3" y="3" width="18" height="18" rx="2" stroke="currentColor" strokeWidth="2" strokeLinejoin="round"/>
    <path d="M3 9H21" stroke="currentColor" strokeWidth="2"/>
    <path d="M9 3V21" stroke="currentColor" strokeWidth="2"/>
  </svg>
);

const EyeIcon = ({ show }) => (
  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    {show ? (
      <><path d="M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.94M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19m-6.72-1.07a3 3 0 1 1-4.24-4.24" /><line x1="1" y1="1" x2="23" y2="23" /></>
    ) : (
      <><path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z" /><circle cx="12" cy="12" r="3" /></>
    )}
  </svg>
);

import { API_BASE_URL } from '../apiConfig';

const Login = ({ onLogin }) => {
  const [showSignupPopup, setShowSignupPopup] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [passVisible, setPassVisible] = useState(false);

  const handlePortalLogin = (e) => {
    e.preventDefault();
    setLoading(true);
    setError("");

    const data = {
      username: e.target.Username.value,
      password: e.target.Password.value
    };

    fetch(`${API_BASE_URL}/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data)
    })
    .then(res => res.json())
    .then(res => {
      setLoading(false);
      if(res.status === "success") {
        onLogin(res); // Pass full user data (role, etc)
      } else {
        setError(res.message);
      }
    })
    .catch(() => {
      setLoading(false);
      setError("Cloud connection failed.");
    });
  };

  return (
    <StyledWrapper>
      {/* SIGNUPPOPUP MODAL */}
      {showSignupPopup && (
        <div className="popup-overlay" onClick={() => setShowSignupPopup(false)}>
           <div className="popup-card" onClick={(e) => e.stopPropagation()}>
              <div className="popup-icon">
                <svg width="60" height="60" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                  <path d="M12 22C17.5228 22 22 17.5228 22 12C22 6.47715 17.5228 2 12 2C6.47715 2 2 6.47715 2 12C2 17.5228 6.47715 22 12 22Z" stroke="#10b981" strokeWidth="2"/>
                  <path d="M12 8V12" stroke="#10b981" strokeWidth="2" strokeLinecap="round"/>
                  <circle cx="12" cy="16" r="1.5" fill="#10b981"/>
                </svg>
              </div>
              <h3>Administrator Notice</h3>
              <p>Please contact your <span className="highlight">Manager</span> to provide credentials for portal access.</p>
              <button className="close-popup-btn" onClick={() => setShowSignupPopup(false)}>Got it</button>
           </div>
        </div>
      )}

      {/* BACK BUTTON WITH GLOBAL STYLE */}
      <div className="back-btn-container">
        <AnimatedButton 
          text="Back to Site" 
          onClick={() => onLogin()} 
          iconDirection="left"
        />
      </div>

      <div className="login-card">
        <div className="login-left">
          <div className="floating-icons">
            {[...Array(6)].map((_, i) => (
              <WindowIcon key={i} size={40 + i * 10} className={`icon icon-${i}`} />
            ))}
          </div>

          <div className="logo-container">
            <div className="logo" style={{ display: 'flex', alignItems: 'center', gap: '1.5rem' }}>
              <img src="/company_logo.jpg" alt="Delta Logo" style={{ height: '60px', width: 'auto' }} />
              <span style={{ fontSize: '1.8rem', fontWeight: 800, letterSpacing: '2px', color: 'white' }}>DELTA UPVC WINDOWS</span>
            </div>
          </div>
          <h1>Welcome to Delta UPVC Portal</h1>
          <p className="quote">"Precision Engineering, Sustainable Living. Access your corporate dashboard."</p>
        </div>
        <div className="login-right">
          <form className="login-form" onSubmit={handlePortalLogin}>
            <div className="form-heading">Login to Account</div>
            
            {error && <div className="error-message">{error}</div>}

            <div className="input-field-group">
              <label className="label">Username</label>
              <input autoComplete="off" placeholder="e.g. ceo_delta" name="Username" id="Username" className="input" type="text" required />
            </div>
            
            <div className="input-field-group">
              <label className="label">Password</label>
              <div className="pass-wrapper">
                <input autoComplete="off" placeholder="••••••••" name="Password" id="Password" className="input" type={passVisible ? "text" : "password"} required />
                <button type="button" className="eye-btn" onClick={() => setPassVisible(!passVisible)}><EyeIcon show={passVisible}/></button>
              </div>
            </div>
            
            <div className="forgot-password">
              <a href="#" onClick={(e) => { e.preventDefault(); setShowSignupPopup(true); }}>Forgot Password?</a>
            </div>
            
            <AnimatedButton 
              text={loading ? "VERIFYING..." : "LOG IN NOW"} 
              className="portal-submit"
            />
            
            <div className="signup-link">
              Don't have an account? <a href="#" onClick={(e) => { e.preventDefault(); setShowSignupPopup(true); }}>Sign up</a>
            </div>
          </form>
        </div>
      </div>
    </StyledWrapper>
  );
}

const StyledWrapper = styled.div`
  min-height: 100vh;
  width: 100%;
  display: flex;
  justify-content: center;
  align-items: center;
  padding: 2rem;
  overflow: hidden;
  position: relative;
  background: radial-gradient(125% 125% at 50% 10%, #fff 40%, #10b981 100%);

  .error-message {
    color: #ef4444;
    background: #fee2e2;
    padding: 0.75rem;
    border-radius: 0.75rem;
    font-size: 0.875rem;
    margin-bottom: 20px;
    border: 1px solid #fecaca;
  }

  /* POPUP STYLES */
  .popup-overlay {
    position: fixed;
    inset: 0;
    background: rgba(0, 0, 0, 0.4);
    backdrop-filter: blur(8px);
    display: flex;
    justify-content: center;
    align-items: center;
    z-index: 1000;
    animation: fadeIn 0.3s ease;
  }

  @keyframes fadeIn { from { opacity: 0; } to { opacity: 1; } }

  .popup-card {
    background: white;
    padding: 3rem;
    border-radius: 2rem;
    max-width: 450px;
    width: 90%;
    text-align: center;
    box-shadow: 0 40px 80px rgba(0, 0, 0, 0.2);
    animation: popIn 0.4s cubic-bezier(0.175, 0.885, 0.32, 1.275);
    border-top: 6px solid #10b981;
  }

  .pass-wrapper { position: relative; width: 100%; max-width: 240px; }
  .eye-btn { position: absolute; right: 0.8rem; top: 50%; transform: translateY(-50%); background: transparent; border: none; color: #94a3b8; cursor: pointer; display: flex; align-items: center; justify-content: center; padding: 0.5rem; }

  @keyframes popIn { from { transform: scale(0.8); opacity: 0; } to { transform: scale(1); opacity: 1; } }

  .popup-icon { margin-bottom: 2rem; }
  .popup-card h3 { font-size: 1.6rem; color: #064e3b; margin-bottom: 1.5rem; }
  .popup-card p { font-size: 1.1rem; color: #4b5563; line-height: 1.6; margin-bottom: 2rem; }
  .popup-card .highlight { color: #10b981; font-weight: 800; text-decoration: underline; }
  .close-popup-btn { background: #10b981; color: white; padding: 12px 30px; border-radius: 100px; border: none; font-weight: 700; cursor: pointer; transition: all 0.3s ease; }
  .close-popup-btn:hover { background: #059669; transform: translateY(-2px); }

  .back-btn-container { position: absolute; top: 2rem; left: 2rem; z-index: 100; }

  .login-card {
    display: flex;
    max-width: 1000px;
    width: 100%;
    background: white;
    border-radius: 2rem;
    overflow: hidden;
    box-shadow: 0 25px 50px -12px rgba(16, 185, 129, 0.15);
    position: relative;
    z-index: 2;
  }

  .login-left {
    flex: 1;
    background: #10b981;
    padding: 4rem;
    color: white;
    display: flex;
    flex-direction: column;
    justify-content: center;
    gap: 2rem;
    position: relative;
    overflow: hidden;
  }

  .floating-icons { position: absolute; inset: 0; pointer-events: none; z-index: 0; }

  @keyframes iconPop {
    0% { transform: scale(0) rotate(-20deg); opacity: 0; }
    50% { transform: scale(1.2) rotate(10deg); opacity: 0.2; }
    100% { transform: scale(1) rotate(0deg); opacity: 0.15; }
  }

  @keyframes iconFloat {
    0% { transform: translateY(0); }
    50% { transform: translateY(-20px); }
    100% { transform: translateY(0); }
  }

  .icon { position: absolute; color: white; opacity: 0; animation: iconPop 1s ease-out forwards, iconFloat 4s ease-in-out infinite; }
  .icon-0 { top: 10%; left: 10%; }
  .icon-1 { top: 60%; left: 15%; }
  .icon-2 { top: 30%; left: 70%; }
  .icon-3 { top: 80%; left: 60%; }
  .icon-4 { top: 20%; left: 40%; }
  .icon-5 { top: 50%; left: 80%; }

  .login-left h1 { font-size: 3rem; line-height: 1.1; color: white; position: relative; z-index: 1; }
  .login-left .quote { font-size: 1.25rem; font-style: italic; opacity: 0.9; position: relative; z-index: 1; }

  .login-right { flex: 1; padding: 4rem; display: flex; flex-direction: column; justify-content: center; align-items: flex-start; }
  .login-form { width: 100%; max-width: 320px; background: #ffffff; animation: fadeInForm 1s ease-out; }

  @keyframes fadeInForm {
    0% { opacity: 0; transform: scale(0.9); }
    100% { opacity: 1; transform: scale(1); }
  }

  .form-heading { text-align: left; color: #333; font-size: 1.8rem; font-weight: 700; margin-bottom: 35px; letter-spacing: 0.5px; }
  .input-field-group { margin-bottom: 25px; width: 100%; }

  .input {
    width: 100%;
    max-width: 240px;
    height: 48px;
    background-color: #05060f0a;
    border-radius: .5rem;
    padding: 0 1rem;
    border: 2px solid transparent;
    font-size: 1rem;
    transition: all .3s cubic-bezier(.25,.01,.25,1) 0s;
    display: block;
    margin: 0;
    color: #000000;
  }

  .label { display: block; margin-bottom: .4rem; font-size: .9rem; font-weight: bold; color: #05060f99; transition: color .3s cubic-bezier(.25,.01,.25,1) 0s; }
  .input:hover, .input:focus, .input-field-group:hover .input { outline: none; border-color: #10b981; background-color: #ffffff; }
  .input-field-group:hover .label, .input:focus { color: #10b981; }

  .forgot-password { text-align: left; margin-top: 10px; margin-bottom: 30px; }
  .forgot-password a { font-size: 14px; color: #059669; text-decoration: none; transition: color 0.3s ease; font-weight: 600; }
  .forgot-password a:hover { color: #10b981; }

  .portal-submit { margin: 0 0 25px 0 !important; }
  .signup-link { text-align: left; font-size: 14px; color: #6b7280; }
  .signup-link a { color: #10b981; text-decoration: none; font-weight: 700; }

  @media (max-width: 768px) {
    padding: 1rem;

    .back-btn-container {
      position: absolute;
      top: 1.5rem;
      left: 1rem;
      z-index: 1000;
      width: auto !important;
      margin-bottom: 0 !important;
    }

    .login-card {
      margin-top: 4rem;
      flex-direction: column;
      box-shadow: none;
      border-radius: 0;
    }

    .login-left {
      padding: 3rem 1.5rem;
      min-height: auto;
      text-align: center;
      gap: 1.5rem;
    }

    .login-left h1 { font-size: 1.8rem; }
    .logo-container .logo { flex-direction: column; gap: 0.5rem !important; }
    .logo-container span { font-size: 1.2rem !important; text-align: center; }

    .login-right {
      padding: 2.5rem 1.5rem;
      align-items: center;
    }

    .login-form {
      max-width: 100%;
    }

    .input, .pass-wrapper {
      max-width: 100%;
    }

    .form-heading {
      font-size: 1.5rem;
      margin-bottom: 25px;
      text-align: center;
    }
  }
`;

export default Login;
