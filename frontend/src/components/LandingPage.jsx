import React from 'react';
import { Link } from 'react-router-dom';

// SVG Icons as components
const MenuIcon = () => (
  <svg style={{ height: '24px', width: '24px' }} fill="none" viewBox="0 0 24 24" stroke="currentColor">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 6h16M4 12h16M4 18h16" />
  </svg>
);

const SmartAIRoutingIcon = () => (
  <svg style={{ width: '32px', height: '32px', color: '#CBD5E0' }} fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z"></path>
  </svg>
);

const RealTimeTrackingIcon = () => (
  <svg style={{ width: '32px', height: '32px', color: '#CBD5E0' }} fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z"></path>
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 11a3 3 0 11-6 0 3 3 0 016 0z"></path>
  </svg>
);

const DirectContactIcon = () => (
  <svg style={{ width: '32px', height: '32px', color: '#CBD5E0' }} fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3 8l7.89 4.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z"></path>
  </svg>
);

// Logo Component
const Logo = ({ size = 'small' }) => {
  const isSmall = size === 'small';
  const circleClass = isSmall ? 'logo-circle-small' : 'logo-circle-large';
  const textClass = isSmall ? 'logo-text-small' : 'logo-text-large';
  const titleSize = isSmall ? '20px' : '36px';

  return (
    <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
      <div className={`logo-circle ${circleClass}`}>
        <span className={textClass}>
          <span style={{ color: '#22D3EE' }}>C</span>
          <span style={{ color: '#60A5FA' }}>L</span>
        </span>
      </div>
      <span style={{ fontSize: titleSize, fontWeight: 'bold', color: 'white', textShadow: '0 0 10px rgba(255, 255, 255, 0.3)' }}>
        CivicLink
      </span>
    </div>
  );
};

// Navigation Component
const Header = () => {
  return (
    <nav className="nav-glass" style={{ position: 'fixed', top: 0, width: '100%', zIndex: 50 }}>
      <div style={{ maxWidth: '1280px', margin: '0 auto', padding: '0 24px' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', height: '64px' }}>
          <Logo size="small" />

          {/* Desktop Navigation Links */}
          <div style={{ display: 'none', gap: '32px', alignItems: 'center' }} className="desktop-nav">
            <a href="#" style={{ color: 'white', fontWeight: 500, textDecoration: 'none', fontSize: '16px' }}>Home</a>
            <a href="#" className="nav-link" style={{ textDecoration: 'none', fontSize: '16px' }}>Features</a>
            <a href="#" className="nav-link" style={{ textDecoration: 'none', fontSize: '16px' }}>How It Works</a>
            <a href="#" className="nav-link" style={{ textDecoration: 'none', fontSize: '16px' }}>About Us</a>
            <a href="#" className="nav-link" style={{ textDecoration: 'none', fontSize: '16px' }}>Contact</a>
          </div>

          {/* Mobile menu button */}
          <div className="mobile-nav" style={{ display: 'none' }}>
            <button style={{ color: '#A0AEC0', background: 'none', border: 'none', cursor: 'pointer' }}>
              <MenuIcon />
            </button>
          </div>
        </div>
      </div>
    </nav>
  );
};

// Hero Section Component
const Hero = () => (
  <section style={{ paddingTop: '128px', paddingBottom: '80px', paddingLeft: '16px', paddingRight: '16px' }}>
    <div style={{ maxWidth: '1024px', margin: '0 auto', textAlign: 'center' }}>
    
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '12px', marginBottom: '48px' }}>
          <Logo size="large" />
        </div>

        {/* Main Headline */}
        <div style={{ position: 'relative', display: 'inline-block', marginBottom: '24px' }}>
          {/* Glowing gradient background behind text */}
          <div
            style={{
              position: 'absolute',
              left: '50%',
              top: '50%',
              transform: 'translate(-50%, -50%)',
              width: '420px',
              height: '90px',
              zIndex: 0,
              filter: 'blur(64px)', // More blur
              opacity: 0.25,        // Much less intensity
              background: 'linear-gradient(90deg, #FF1744 0%, #FF9100 50%, #FFEA00 100%)',
            }}
          />
          <h1
            style={{
              fontSize: '48px',
              fontWeight: 'bold',
              marginBottom: 0,
              lineHeight: 1.1,
              color: 'white',
              position: 'relative',
              zIndex: 1,
            }}
          >
            Report Civic Issues,<br />
            <span
              style={{
                background: 'linear-gradient(90deg, #FF1744 0%, #FF9100 50%, #FFEA00 100%)',
                WebkitBackgroundClip: 'text',
                WebkitTextFillColor: 'transparent',
                backgroundClip: 'text',
                color: 'transparent',
              }}
            >
              Drive Change
            </span>
          </h1>
          <p style={{ fontSize: '20px', color: '#A0AEC0', marginBottom: '48px', maxWidth: '512px', marginLeft: 'auto', marginRight: 'auto' }}>
            Connecting citizens with local authorities to build better communities
          </p>
          </div>
      <div style={{ display: 'flex', flexDirection: 'column', gap: '16px', justifyContent: 'center', alignItems: 'center' }}>
        <div style={{ display: 'flex', gap: '16px', flexWrap: 'wrap', justifyContent: 'center' }}>
          <Link to="/signup" className="btn-primary" style={{ padding: '16px 32px', borderRadius: '9999px', color: 'white', fontWeight: 500, cursor: 'pointer', textDecoration: 'none' }}>
            Get Started
          </Link>
          <Link to="/signin" className="btn-secondary" style={{ padding: '16px 32px', borderRadius: '9999px', color: 'white', fontWeight: 500, cursor: 'pointer', textDecoration: 'none' }}>
            Learn More
          </Link>
        </div>
      </div>
    </div>
  </section>
);

// Feature Card Component
const FeatureCard = ({ icon, title, description, activeDotIndex }) => (
  <div style={{ background: 'rgba(0, 0, 0, 0.3)', backdropFilter: 'blur(20px)', border: '1px solid rgba(255, 255, 255, 0.1)', borderRadius: '16px', padding: '32px', textAlign: 'center' }}>
    <div className="icon-container">
      {icon}
    </div>
    <h3 style={{ fontSize: '20px', fontWeight: 'bold', color: 'white', marginBottom: '16px' }}>{title}</h3>
    <p style={{ color: '#A0AEC0', marginBottom: '24px' }}>{description}</p>
    <div style={{ display: 'flex', justifyContent: 'center', gap: '8px' }}>
      <div className={`feature-dot ${activeDotIndex === 0 ? 'active' : 'inactive'}`}></div>
      <div className={`feature-dot ${activeDotIndex === 1 ? 'active' : 'inactive'}`}></div>
      <div className={`feature-dot ${activeDotIndex === 2 ? 'active' : 'inactive'}`}></div>
    </div>
  </div>
);

// Features Section Component
const Features = () => (
  <section style={{ paddingBottom: '80px', paddingLeft: '16px', paddingRight: '16px' }}>
    <div style={{ maxWidth: '1152px', margin: '0 auto' }}>
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: '32px' }}>
        <FeatureCard
          icon={<SmartAIRoutingIcon />}
          title="Smart AI Routing"
          description="Automatically routes your reports to the right department using intelligent categorization"
          activeDotIndex={0}
        />
        <FeatureCard
          icon={<RealTimeTrackingIcon />}
          title="Real-time Tracking"
          description="Track the progress of your reports from submission to resolution with live updates"
          activeDotIndex={1}
        />
        <FeatureCard
          icon={<DirectContactIcon />}
          title="Direct Department Contact"
          description="Get direct communication with municipal departments handling your civic issues"
          activeDotIndex={2}
        />
      </div>
    </div>
  </section>
);

// Floating AI Button Component
const FloatingAIButton = () => (
  <div style={{ position: 'fixed', bottom: '32px', right: '32px', zIndex: 50 }}>
    <button className="ai-button" style={{ width: '56px', height: '56px', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'white', fontWeight: 500, cursor: 'pointer', fontSize: '14px' }}>
      ai
    </button>
  </div>
);

// Main Landing Page Component
const LandingPage = () => {
  return (
    <div style={{ margin: 0, padding: 0, width: '100%', minHeight: '100vh' }}>
      {/* Inline CSS exactly from the design */}
      <style>
        {`
                    * {
                        margin: 0;
                        padding: 0;
                        box-sizing: border-box;
                    }
                    
                    body {
                        margin: 0;
                        padding: 0;
                        width: 100%;
                        overflow-x: hidden;
                    }
                    
                    #root {
                        margin: 0;
                        padding: 0;
                        width: 100%;
                    }
                    
                    .landing-page * {
                        margin: 0;
                        padding: 0;
                        box-sizing: border-box;
                    }
                    
                    .landing-page {
                        font-family: 'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', 'Roboto', sans-serif;
                        background-color: transparent;
                        color: white;
                        min-height: 100vh;
                        overflow-x: hidden;
                        margin: 0;
                        padding: 0;
                    }
                    
                    .gradient-bg {
                        position: fixed;
                        top: 0;
                        left: 0;
                        width: 100vw;
                        height: 100vh;
                        z-index: -1;
                        background: #0D0D0F;
                    }
                    
                    .gradient-bg::before {
                        content: '';
                        position: absolute;
                        top: -50%;
                        left: -50%;
                        width: 200%;
                        height: 200%;
                        background: 
                            radial-gradient(ellipse 800px 600px at 30% 20%, rgba(138, 43, 226, 0.4) 0%, transparent 60%),
                            radial-gradient(ellipse 600px 800px at 70% 80%, rgba(50, 205, 50, 0.3) 0%, transparent 60%),
                            radial-gradient(ellipse 700px 500px at 20% 70%, rgba(0, 0, 139, 0.3) 0%, transparent 60%);
                        filter: blur(60px);
                        animation: float 20s ease-in-out infinite;
                    }
                    
                    @keyframes float {
                        0%, 100% { transform: translate(0, 0) rotate(0deg); }
                        33% { transform: translate(30px, -30px) rotate(120deg); }
                        66% { transform: translate(-20px, 20px) rotate(240deg); }
                    }
                    
                    .glass-card {
                        background: rgba(0, 0, 0, 0.3);
                        backdrop-filter: blur(20px);
                        -webkit-backdrop-filter: blur(20px);
                        border: 1px solid rgba(255, 255, 255, 0.1);
                        transition: all 0.3s ease;
                        position: relative;
                        overflow: hidden;
                    }
                    
                    .glass-card::before {
                        content: '';
                        position: absolute;
                        width: 60px;
                        height: 2px;
                        background: linear-gradient(90deg, transparent, #00ff88, #ff0080, #00ff88, transparent);
                        border-radius: 1px;
                        box-shadow: 0 0 20px #00ff88;
                        animation: runAroundBorder 4s linear infinite;
                        z-index: 1;
                    }
                    
                    .glass-card:hover {
                        transform: translateY(-5px);
                        background: rgba(0, 0, 0, 0.4);
                    }
                    
                    @keyframes runAroundBorder {
                        0% { top: 0; left: 0; width: 60px; height: 2px; transform: rotate(0deg); }
                        25% { top: 0; right: 0; left: auto; width: 2px; height: 60px; transform: rotate(90deg); }
                        50% { bottom: 0; right: 0; top: auto; left: auto; width: 60px; height: 2px; transform: rotate(180deg); }
                        75% { bottom: 0; left: 0; top: auto; right: auto; width: 2px; height: 60px; transform: rotate(270deg); }
                        100% { top: 0; left: 0; bottom: auto; right: auto; width: 60px; height: 2px; transform: rotate(360deg); }
                    }
                    
                    .btn-primary {
                        background: linear-gradient(135deg, #3B82F6 0%, #8B5CF6 100%);
                        box-shadow: 0 8px 25px rgba(139, 92, 246, 0.4);
                        border: none;
                        transition: all 0.3s ease;
                    }
                    
                    .btn-primary:hover {
                        transform: translateY(-2px);
                        box-shadow: 0 12px 35px rgba(139, 92, 246, 0.5);
                    }
                    
                    .btn-secondary {
                        background: linear-gradient(135deg, #10B981 0%, #06D6A0 100%);
                        box-shadow: 0 8px 25px rgba(16, 185, 129, 0.4);
                        border: none;
                        transition: all 0.3s ease;
                    }
                    
                    .btn-secondary:hover {
                        transform: translateY(-2px);
                        box-shadow: 0 12px 35px rgba(16, 185, 129, 0.5);
                    }
                    
                    .nav-glass {
                        background: rgba(13, 13, 15, 0.8);
                        backdrop-filter: blur(20px);
                        -webkit-backdrop-filter: blur(20px);
                        border-bottom: 1px solid rgba(255, 255, 255, 0.08);
                        box-shadow: 0 1px 3px rgba(0, 0, 0, 0.12);
                    }
                    
                    .nav-link {
                        transition: color 0.3s ease;
                        color: #A0AEC0;
                    }
                    
                    .nav-link:hover {
                        color: white;
                    }
                    
                    .ai-button {
                        background: rgba(0, 0, 0, 0.8);
                        backdrop-filter: blur(10px);
                        border: 1px solid rgba(255, 255, 255, 0.2);
                        box-shadow: 0 0 20px rgba(255, 255, 255, 0.1);
                        transition: all 0.3s ease;
                    }
                    
                    .ai-button:hover {
                        transform: scale(1.1);
                        box-shadow: 0 0 30px rgba(255, 255, 255, 0.2);
                    }
                    
                    .feature-dot {
                        width: 8px;
                        height: 8px;
                        border-radius: 50%;
                        transition: all 0.3s ease;
                    }
                    
                    .feature-dot.active { background-color: white; }
                    .feature-dot.inactive { background-color: #4A5568; }
                    
                    .logo-circle {
                        background: linear-gradient(135deg, #1a1a2e, #16213e);
                        border: 1px solid rgba(34, 211, 238, 0.3);
                        border-radius: 50%;
                        display: flex;
                        align-items: center;
                        justify-content: center;
                        box-shadow: 0 0 15px rgba(34, 211, 238, 0.2);
                    }
                    
                    .logo-circle-small { width: 40px; height: 40px; }
                    .logo-circle-large { width: 64px; height: 64px; }
                    
                    .logo-text-small { font-size: 14px; font-weight: 700; text-shadow: 0 0 10px currentColor; }
                    .logo-text-large { font-size: 18px; font-weight: 700; text-shadow: 0 0 10px currentColor; }
                    
                    .icon-container {
                        width: 64px;
                        height: 64px;
                        border: 2px solid #4A5568;
                        border-radius: 16px;
                        display: flex;
                        align-items: center;
                        justify-content: center;
                        margin: 0 auto 24px;
                    }
                    
                    @media (min-width: 768px) {
                        .desktop-nav { display: flex !important; }
                        .mobile-nav { display: none !important; }
                    }
                    
                    @media (max-width: 767px) {
                        .desktop-nav { display: none !important; }
                        .mobile-nav { display: block !important; }
                    }
                `}
      </style>

      <div className="landing-page">
        <div className="gradient-bg"></div>
        <Header />
        <main>
          <Hero />
          <Features />
        </main>
        <FloatingAIButton />
      </div>
    </div>
  );
};

export default LandingPage;
