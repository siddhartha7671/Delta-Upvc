import React, { useState, useEffect, useRef } from 'react';
import Header from './components/Header';
import Card from './components/Card';
import Loader from './components/Loader';
import Login from './components/Login';
import Dashboard from './components/Dashboard';
import AnimatedButton from './components/AnimatedButton';
import ContactFormPage from './components/ContactFormPage';

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

const ProductDetail = ({ product, onBack, onPortalNav, onContactNav }) => {
  const photos = [
    "https://images.unsplash.com/photo-1600607686527-6fb886090705?w=800&q=80",
    "https://images.unsplash.com/photo-1540502126233-aefb49466ed5?w=800&q=80"
  ];

  return (
    <div className="app-container">
      <Header onPortalNav={onPortalNav} onContactNav={onContactNav} activeNav="home" />
      <div className="product-detail-container">
        <div style={{ marginBottom: '2rem' }}>
          <AnimatedButton text="Back to Home" onClick={onBack} iconDirection="left" />
        </div>
        <div className="product-hero">
          <h1>{product.title}</h1>
          <p className="product-desc">
            {product.desc} Experience unparalleled quality and craftsmanship with Delta UPVC's signature line. Our {product.title.toLowerCase()} are built to last.
          </p>
        </div>
        <div className="product-gallery">
          {photos.map((src, idx) => (
            <div className="product-image-card" key={idx}>
               <img src={src} alt={`${product.title} Details`} loading="lazy" style={{willChange: 'transform'}} />
            </div>
          ))}
        </div>
      </div>
      <footer className="footer"><p>&copy; 2026 Delta UPVC Windows. All rights reserved.</p></footer>
    </div>
  );
};

function App() {
  const [activeProduct, setActiveProduct] = useState(null);
  const [showLoader, setShowLoader] = useState(false);
  const [showPortal, setShowPortal] = useState(false);
  const [showContactPage, setShowContactPage] = useState(false);
  const [activeUser, setActiveUser] = useState(null);

  const [services, setServices] = useState([
    { title: "UPVC Sliding Windows", desc: "Smooth, space-saving sliding functionality with superior insulation.", color: "#e11d48" },
    { title: "Premium Doors", desc: "Durable, elegant composite doors offering maximum security.", color: "#f472b6" },
    { title: "Casement Windows", desc: "Classic outward-opening design with airtight sealing properties.", color: "#10b981" },
    { title: "Smart Ventilation", desc: "Automated airflow systems integrated into refined window frames.", color: "#3b82f6" },
  ]);

  useEffect(() => {
    fetch('/api/services')
      .then(res => res.json())
      .then(data => { if (data.length > 0) setServices(data); })
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
    setActiveUser(userData);
    setShowPortal(false);
  };

  const handleLogout = () => {
    setActiveUser(null);
    setShowPortal(true); // Retain the portal view but clear the user
    window.scrollTo(0, 0);
  };

  const marqueeItems = [
    "UV Protected Windows", "Energy Efficient Doors", "10-Year Warranty", "Double Glazed Glass", "100% Recyclable UPVC", "Sound Proof Frames"
  ];

  return (
    <>
      {showLoader && <Loader />}
      
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

            {/* RESTORED MARQUEE FROM PREVIOUS DESIGN */}
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

          {/* RESTORED NEUMORPHIC STATS FROM PREVIOUS DESIGN */}
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
              <div className="ceo-visual"><div className="ceo-photo-container"><img src="https://images.unsplash.com/photo-1560250097-0b93528c311a?w=600&h=800&fit=crop" alt="CEO Portrait" loading="lazy" /></div></div>
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

          <footer className="footer"><p>&copy; 2026 Delta UPVC Windows. All rights reserved.</p></footer>
        </div>
      )}
    </>
  );
}

export default App;
