import React, { useState, useEffect, useRef } from 'react';
import Header from './components/Header';
import Card from './components/Card';
import Loader from './components/Loader';
import Login from './components/Login';
import Dashboard from './components/Dashboard';
import AnimatedButton from './components/AnimatedButton';
import ContactFormPage from './components/ContactFormPage';
import { API_BASE_URL } from './apiConfig';

const CountUpAnimation = ({ end, duration = 2000, suffix = "" }) => {
  const [count, setCount] = useState(0);
  const [isVisible, setIsVisible] = useState(false);
  const ref = useRef(null);

  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => { if (entry.isIntersecting) setIsVisible(true); },
      { threshold: 0.1 }
    );
    if (ref.current) observer.observe(ref.current);
    return () => observer.disconnect();
  }, []);

  useEffect(() => {
    if (!isVisible) return;
    let startTime = null;
    let animationFrame;
    const animate = (currentTime) => {
      if (!startTime) startTime = currentTime;
      const progress = Math.min((currentTime - startTime) / duration, 1);
      const easeProgress = 1 - Math.pow(1 - progress, 4);
      setCount(Math.floor(easeProgress * end));
      if (progress < 1) animationFrame = requestAnimationFrame(animate);
      else setCount(end);
    };
    animationFrame = requestAnimationFrame(animate);
    return () => cancelAnimationFrame(animationFrame);
  }, [end, duration, isVisible]);

  const displayCount = count >= 1000 ? count.toLocaleString() : count;
  return <span ref={ref} className="stat-number">{displayCount}{suffix}</span>;
};

const Footer = ({ onTermsClick }) => (
  <footer className="enhanced-footer">
    <div className="footer-container">
       <div className="footer-top">
          <div className="footer-brand">
             <img src="/company_logo.jpg" alt="Delta Logo" />
             <div className="brand-text">
                <h3>DELTA UPVC</h3>
                <span>WINDOWS & DOORS</span>
             </div>
          </div>
          <div className="footer-nav">
             <h4>Quick Links</h4>
             <button onClick={() => window.scrollTo({top: 0, behavior: 'smooth'})}>Home</button>
             <button onClick={onTermsClick}>Terms & Conditions</button>
          </div>
       </div>
       <div className="footer-bottom">
          <p>&copy; 2026 Delta UPVC Windows. All rights reserved. | 20-Year Premium Warranty</p>
       </div>
    </div>
  </footer>
);

const TermsModal = ({ isOpen, onClose }) => {
  if (!isOpen) return null;
  return (
    <div className="terms-overlay" onClick={onClose}>
       <div className="terms-modal" onClick={e => e.stopPropagation()}>
          <button className="terms-close" onClick={onClose}>×</button>
          <div className="terms-content">
             <h2>📄 Terms & Conditions – Delta UPVC Windows</h2>
             <div className="terms-body">
                <h3>1. Acceptance of Terms</h3>
                <p>By accessing and using the services of Delta UPVC Windows, you agree to be bound by these Terms & Conditions.</p>

                <h3>2. Products & Services</h3>
                <p>Delta UPVC Windows provides UPVC window and door solutions including manufacturing, supply, and installation. Product specifications, designs, and pricing are subject to change without prior notice.</p>

                <h3>3. Quotations & Orders</h3>
                <ul>
                  <li>All quotations are valid for a limited period as mentioned.</li>
                  <li>Orders are confirmed only after advance payment.</li>
                  <li>Custom-made products cannot be cancelled once production begins.</li>
                </ul>

                <h3>4. Pricing & Payments</h3>
                <ul>
                  <li>Prices are subject to applicable taxes.</li>
                  <li>Payments must be made as per agreed terms.</li>
                  <li>Delay in payment may lead to delay in delivery or installation.</li>
                </ul>

                <h3>5. Delivery & Installation</h3>
                <ul>
                  <li>Delivery timelines are approximate and may vary due to unforeseen circumstances.</li>
                  <li>Installation will be scheduled after site readiness is confirmed.</li>
                  <li>The customer must ensure proper site conditions before installation.</li>
                </ul>

                <h3>6. Customer Responsibilities</h3>
                <ul>
                  <li>Provide accurate measurements and site details (if not measured by our team).</li>
                  <li>Ensure safe and accessible installation space.</li>
                  <li>Avoid any modifications after installation.</li>
                </ul>

                <h3>7. Intellectual Property</h3>
                <p>All designs, logos, and materials belong to Delta UPVC Windows and cannot be copied or reused without permission.</p>

                <h3>8. Limitation of Liability</h3>
                <p>Delta UPVC Windows is not liable for: Delays caused by external factors, damage due to improper usage, or structural issues at customer site.</p>

                <h3>9. Cancellation & Refund Policy</h3>
                <ul>
                  <li>Orders once confirmed cannot be cancelled after production starts.</li>
                  <li>Refunds (if applicable) will be processed as per company policy.</li>
                </ul>

                <h3>10. Changes to Terms</h3>
                <p>We reserve the right to update these terms at any time.</p>
             </div>
             <div className="terms-footer">
                <button onClick={onClose}>I Understand</button>
             </div>
          </div>
       </div>
    </div>
  );
};

const ProductDetail = ({ product, onBack, onPortalNav, onContactNav, onTermsClick }) => {
  const photos = product.photos || [
    "https://images.unsplash.com/photo-1600607686527-6fb886090705?w=800&q=80",
    "https://images.unsplash.com/photo-1540502126233-aefb49466ed5?w=800&q=80"
  ];

  const isDoor = product.title.includes("Doors");
  const isCasement = product.title.includes("Casement");
  const isRepair = product.title.includes("Repair");
  
  const features = isDoor ? [
    {
      title: "Enhanced Security",
      desc: "Built with multi-point locking mechanisms for maximum safety.",
      icon: <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5"><rect x="3" y="11" width="18" height="11" rx="2" ry="2"/><path d="M7 11V7a5 5 0 0 1 10 0v4"/></svg>
    },
    {
      title: "Wind Resistance",
      desc: "Sturdy profile designs that can withstand extreme wind pressure.",
      icon: <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5"><path d="M17.5 19c.7-1.1 1.2-2.3 1.4-3.5a8 8 0 0 0-14.8-4M2 12h3M9.5 19.3c-2 .5-4.1.2-5.9-1"/><path d="M22 6l-3-3-3 3"/><path d="M19 3v9"/></svg>
    },
    {
      title: "Sound Insulation",
      desc: "Reduces outside noise significantly for a quiet indoor life.",
      icon: <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5"><path d="M12 2v20M5 7v10M19 7v10M2 10v4M22 10v4"/></svg>
    }
  ] : isCasement ? [
    {
      title: "Traditional Charm",
      desc: "Classic outward-opening design for a timeless European aesthetic.",
      icon: <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5"><path d="M3 3h18v18H3z"/><path d="M12 3v18M3 12h18"/></svg>
    },
    {
      title: "Airtight Sealing",
      desc: "Superior gaskets and multi-chambered profiles for total insulation.",
      icon: <svg viewBox="0 0 120 120" fill="none" stroke="currentColor" strokeWidth="6"><path d="M60 10L10 60L60 110L110 60L60 10Z"/><path d="M60 40V80M40 60H80"/></svg>
    },
    {
      title: "Ventilation Control",
      desc: "Adjustable friction stays for precise airflow management.",
      icon: <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5"><path d="M9.59 4.59A2 2 0 1 1 11 8H2m10.59 11.41A2 2 0 1 0 14 16H2m15.73-8.27A2.5 2.5 0 1 1 19.5 12H2"/></svg>
    }
  ] : isRepair ? [
    {
      title: "Low Maintenance",
      desc: "UPVC requires no painting or varnishing—just a simple wipe keeping it new forever.",
      icon: <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5"><path d="M14.7 6.3a1 1 0 0 0 0 1.4l1.6 1.6a1 1 0 0 0 1.4 0l3.77-3.77a6 6 0 0 1-7.94 7.94l-6.91 6.91a2.12 2.12 0 0 1-3-3l6.91-6.91a6 6 0 0 1 7.94-7.94l-3.76 3.76z"/></svg>
    },
    {
      title: "Precision Re-alignment",
      desc: "Our experts restore original smoothness to even the oldest sliding mechanisms.",
      icon: <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5"><path d="M20 7h-9m3 3-3-3 3-3M4 17h9m-3 3 3-3-3-3"/></svg>
    },
    {
      title: "Anti-Corrosive Care",
      desc: "Hardware upgrades that resist coastal air and oxidation for decades.",
      icon: <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5"><path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/><path d="m9 12 2 2 4-4"/></svg>
    }
  ] : [
    {
      title: "Maximized View",
      desc: "Experience the world with ultra-slim frames and flooding natural light.",
      icon: <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5"><circle cx="12" cy="12" r="5"/><line x1="12" y1="1" x2="12" y2="3"/><line x1="12" y1="21" x2="12" y2="23"/><line x1="4.22" y1="4.22" x2="5.64" y2="5.64"/><line x1="18.36" y1="18.36" x2="19.78" y2="19.78"/><line x1="1" y1="12" x2="3" y2="12"/><line x1="21" y1="12" x2="23" y2="12"/><line x1="4.22" y1="19.78" x2="5.64" y2="18.36"/><line x1="18.36" y1="5.64" x2="19.78" y2="4.22"/></svg>
    },
    {
      title: "Silent Motion",
      desc: "Japanese-engineered nylon rollers for effortless, whisper-quiet operation.",
      icon: <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5"><path d="M11 5L6 9H2v6h4l5 4V5z"/><line x1="23" y1="9" x2="17" y2="15"/><line x1="17" y1="9" x2="23" y2="15"/></svg>
    },
    {
      title: "Weather Shield",
      desc: "Multi-chambered profiles with double-sealed gaskets for 100% protection.",
      icon: <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5"><path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/></svg>
    }
  ];

  return (
    <div className="app-container">
      <Header onPortalNav={onPortalNav} onContactNav={onContactNav} activeNav="home" />
      <div className="product-detail-container">
        <div className="back-btn-corner">
          <AnimatedButton text="Back to Home" onClick={onBack} iconDirection="left" />
        </div>
        
        <section className="product-hero-premium">
           <div className="hero-badge">Delta Precision Series</div>
           <h1>{product.title}</h1>
           <div className="description-accent"></div>
           <p className="product-desc-premium">
             {product.desc}
           </p>
        </section>

        <section className="premium-gallery">
           <div className="gallery-header">
              <h2>Detailed View</h2>
              <p>Every angle reflects engineering perfection.</p>
           </div>
           <div className="gallery-grid-premium">
              {photos.map((src, idx) => (
                <div className="premium-image-wrapper" key={idx}>
                   <img src={src} alt={`${product.title} Details ${idx + 1}`} loading="lazy" />
                   <div className="image-overlay">
                      <span>Delta UPVC • Superior Finish</span>
                   </div>
                </div>
              ))}
           </div>
        </section>

        <section className="premium-features-showcase">
           <div className="showcase-header">
              <span className="subtitle">Delta Innovation</span>
              <h3>Why choose {product.title}?</h3>
              <div className="header-line"></div>
           </div>
           
           <div className="premium-features-grid">
              {features.map((feat, i) => (
                <div className="premium-feat-card" key={i}>
                   <div className="feat-icon-box">{feat.icon}</div>
                   <div className="feat-text">
                      <h4>{feat.title}</h4>
                      <p>{feat.desc}</p>
                   </div>
                   <div className="feat-glow"></div>
                </div>
              ))}
           </div>
        </section>
      </div>
      <Footer onTermsClick={onTermsClick} />
    </div>
  );
};

function App() {
  const [activeProduct, setActiveProduct] = useState(null);
  const [showLoader, setShowLoader] = useState(false);
  const [showPortal, setShowPortal] = useState(false);
  const [showContactPage, setShowContactPage] = useState(false);
  const [showTerms, setShowTerms] = useState(false);
  const [activeUser, setActiveUser] = useState(null);

  const [services, setServices] = useState([
    { title: "UPVC Sliding Windows", desc: "Smooth, space-saving sliding functionality with superior insulation.", color: "#e11d48" },
    { title: "Premium Doors", desc: "Durable, elegant composite doors offering maximum security.", color: "#f472b6" },
    { title: "Casement Windows", desc: "Classic outward-opening design with airtight sealing properties.", color: "#10b981" },
    { title: "Smart Ventilation", desc: "Automated airflow systems integrated into refined window frames.", color: "#3b82f6" },
  ]);

  useEffect(() => {
    // 1. Persistent Session Restore
    const savedSession = localStorage.getItem('deltaUserSession');
    if (savedSession) {
      try {
        setActiveUser(JSON.parse(savedSession));
      } catch (e) {
        localStorage.removeItem('deltaUserSession');
      }
    }


    // 2. Mobile Detection & Policy (Auto-Redirect to Portal)
    const isMobile = window.innerWidth <= 768; // Standard Mobile/Tablet breakpoint
    if (isMobile && !savedSession) {
      setShowPortal(true);
    }

    fetch(`${API_BASE_URL}/services`)
      .then(res => res.json())
      .then(data => { 
        if (data && Array.isArray(data) && data.length > 0) {
          const enriched = data.map(s => {
            if (s.title && s.title.includes("Sliding Windows")) {
              return { ...s, photos: ["/sliding_1.jpg", "/sliding_2.jpg"] };
            }
            if (s.title && s.title.includes("Premium Doors")) {
              return { ...s, photos: ["/door_1.jpg", "/door_2.jpg"] };
            }
            if (s.title && s.title.includes("Casement Windows")) {
              return { ...s, photos: ["/casement_1.jpg", "/casement_2.jpg"] };
            }
            if (s.title && s.title.includes("Repair & Maintenance")) {
                return { ...s, photos: ["/repair_1.jpg", "/repair_2.jpg"] };
            }
            return s;
          });
          setServices(enriched);
        }
      })
      .catch(err => console.log("Backend offline, using fallback data."));

  }, []);

  const triggerPortal = () => {
    setShowLoader(true);
    setTimeout(() => {
      setShowLoader(false);
      setShowPortal(true);
      window.scrollTo(0,0);
    }, 1200);
  };

  const handleHomeNav = () => {
    setShowContactPage(false);
    setActiveProduct(null);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleLoginSuccess = (userData) => {
    // Persist session to local storage for infinite login
    localStorage.setItem('deltaUserSession', JSON.stringify(userData));
    setActiveUser(userData);
    setShowPortal(false);
  };

  const handleLogout = () => {
    // Clear persistent session
    localStorage.removeItem('deltaUserSession');
    setActiveUser(null);
    setShowPortal(true);
    window.scrollTo(0, 0);
  };

  const marqueeItems = [
    "UV Protected Windows", "Energy Efficient Doors", "20-Year Warranty", "Double Glazed Glass", "100% Recyclable UPVC", "Sound Proof Frames"
  ];

  return (
    <>
      {showLoader && <Loader />}
      <TermsModal isOpen={showTerms} onClose={() => setShowTerms(false)} />
      
      {activeUser ? (
        <Dashboard 
          user={activeUser} 
          onLogout={handleLogout} 
          onHomeNav={() => setActiveUser(null)} 
        />
      ) : showPortal ? (
        <Login onLogin={handleLoginSuccess} />
      ) : showContactPage ? (
        <ContactFormPage 
          onBack={() => setShowContactPage(false)} 
          onPortalNav={triggerPortal} 
        />
      ) : activeProduct ? (
        <ProductDetail 
          product={activeProduct} 
          onBack={() => {
            setActiveProduct(null);
            setTimeout(() => document.getElementById('services')?.scrollIntoView({ behavior: 'instant' }), 0);
          }} 
          onPortalNav={triggerPortal}
          onContactNav={() => setShowContactPage(true)}
          onTermsClick={() => setShowTerms(true)}
        />
      ) : (
        <div className="app-container">
          <Header 
            onPortalNav={triggerPortal} 
            onContactNav={() => setShowContactPage(true)} 
            onHomeNav={handleHomeNav}
          />
          
          <section className="hero">
            <div className="hero-content">
              <div className="badge-wrapper"><span className="animated-badge">Delta Quality Standard</span></div>
              <h1>Transforming Homes with <br/><span>Delta UPVC Windows</span></h1>
              <p className="signature-quote">"Crafting elegance, securing homes. Experience the future of living."</p>
              <div className="hero-actions">
                <AnimatedButton 
                  text="Explore Collection" 
                  onClick={() => document.getElementById('services').scrollIntoView({ behavior: 'smooth' })} 
                />
                <AnimatedButton 
                  text="Request Quote" 
                  onClick={() => setShowContactPage(true)} 
                />
              </div>
            </div>

            <div className="marquee-container">
              <div className="marquee-mask">
                <div className="marquee-content">
                  <div className="marquee-group">
                    {marqueeItems.map((item, idx) => (
                      <span key={idx}>
                         <svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor"><circle cx="12" cy="12" r="10" fill="#10b981"/></svg>
                         {item}
                      </span>
                    ))}
                  </div>
                  <div className="marquee-group">
                    {marqueeItems.map((item, idx) => (
                      <span key={idx + 10}>
                         <svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor"><circle cx="12" cy="12" r="10" fill="#10b981"/></svg>
                         {item}
                      </span>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          </section>

          <section className="stats-section">
            <div className="stats-container">
              <div className="neumorphic-stat-card">
                 <CountUpAnimation end={1200} suffix="+" />
                 <p className="stat-label">Homes Secured</p>
              </div>
              <div className="neumorphic-stat-card">
                 <CountUpAnimation end={10} suffix="+" />
                 <p className="stat-label">Award Winning Designs</p>
              </div>
              <div className="neumorphic-stat-card">
                 <CountUpAnimation end={500} suffix="+" />
                 <p className="stat-label">Corporate Clients</p>
              </div>
              <div className="neumorphic-stat-card">
                 <CountUpAnimation end={100} suffix="%" />
                 <p className="stat-label">UPVC Purity Index</p>
              </div>
            </div>
          </section>

          <section id="services" className="services-section">
             <div className="section-header"><h2>Our Premium Solutions</h2><p>Precision-engineered systems for the modern architecture.</p></div>
             <Card services={services} onSelect={(p) => { setActiveProduct(p); window.scrollTo(0,0); }} />
          </section>

          <section className="ceo-section">
            <div className="ceo-container">
              <div className="ceo-glow-card">
                 <div className="ceo-photo-container">
                    <img src="https://images.unsplash.com/photo-1560250097-0b93528c311a?w=600&h=800&fit=crop" alt="CEO Portrait" loading="lazy" />
                 </div>
              </div>
              <div className="ceo-content">
                <h2 className="ceo-quote">"Quality is not an act, it is a habit ingrained in everything we build."</h2>
                <p className="ceo-bio">We started Delta UPVC with a singular vision: to bring world-class, energy-efficient window and door systems to every modern home.</p>
                <div className="ceo-identity"><h4>Aryan Sharma</h4><span>Founder & CEO, Delta Windows</span></div>
              </div>
            </div>
          </section>

          <section id="contact" className="contact-cta-section">
            <div className="cta-content">
              <AnimatedButton text="REQUEST A QUOTE" onClick={() => setShowContactPage(true)} />
            </div>
          </section>

          <Footer onTermsClick={() => setShowTerms(true)} />
        </div>
      )}
    </>
  );
}

export default App;
