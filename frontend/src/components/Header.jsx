import React, { useState, useEffect } from 'react';

function Header({ onPortalNav, onContactNav, onHomeNav, activeNav = 'home' }) {
  const [isVisible, setIsVisible] = useState(true);
  const [lastScrollY, setLastScrollY] = useState(0);

  useEffect(() => {
    let lastKnownScrollY = 0;
    let ticking = false;

    const handleScroll = () => {
      lastKnownScrollY = window.scrollY;

      if (!ticking) {
        window.requestAnimationFrame(() => {
          if (lastKnownScrollY > lastScrollY && lastKnownScrollY > 80) {
            setIsVisible(false);
          } else {
            setIsVisible(true);
          }
          setLastScrollY(lastKnownScrollY);
          ticking = false;
        });

        ticking = true;
      }
    };

    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, [lastScrollY]);

  return (
    <header className={`header ${isVisible ? '' : 'header-hidden'}`}>
      <div className="logo" onClick={onHomeNav} style={{ cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '10px' }}>
        <img src="/company_logo.jpg" alt="Delta Logo" style={{ height: '40px', width: 'auto' }} />
        <span style={{ fontWeight: 800, fontSize: '1.2rem', letterSpacing: '1px' }}>DELTA UPVC WINDOWS</span>
      </div>
      <nav>
        <div className="nav-radio-group">
          <input type="radio" name="nav" id="nav-home" checked={activeNav === 'home'} readOnly />
          <label htmlFor="nav-home" onClick={onHomeNav}>
            <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" width="18" height="18">
              <path d="M10.707 2.293a1 1 0 00-1.414 0l-7 7a1 1 0 001.414 1.414L4 10.414V17a1 1 0 001 1h2a1 1 0 001-1v-2a1 1 0 011-1h2a1 1 0 011 1v2a1 1 0 001 1h2a1 1 0 001-1v-6.586l.293.293a1 1 0 001.414-1.414l-7-7z" />
            </svg>
            Home
          </label>
          <input type="radio" name="nav" id="nav-delta" checked={activeNav === 'delta'} readOnly />
          <label htmlFor="nav-delta" onClick={(e) => { e.preventDefault(); onPortalNav(); }}>
            <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" width="18" height="18">
              <path d="M5 3a1 1 0 000 2c5.523 0 10 4.477 10 10a1 1 0 102 0C17 8.373 11.627 3 5 3z" />
              <path d="M4 9a1 1 0 011-1 7 7 0 017 7 1 1 0 11-2 0 5 5 0 00-5-5 1 1 0 01-1-1zM3 15a2 2 0 114 0 2 2 0 01-4 0z" />
            </svg>
            Delta
          </label>
          <input type="radio" name="nav" id="nav-contact" checked={activeNav === 'contact'} readOnly />
          <label htmlFor="nav-contact" onClick={(e) => { e.preventDefault(); onContactNav(); }}>
            <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" width="18" height="18">
              <path fillRule="evenodd" d="M10 9a3 3 0 100-6 3 3 0 000 6zm-7 9a7 7 0 1114 0H3z" clipRule="evenodd" />
            </svg>
            Contact Us
          </label>
          <div className="nav-glider" />
        </div>
      </nav>
    </header>
  );
}

export default Header;
