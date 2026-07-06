import React, { useState } from 'react';
import {
  Box,
  ChevronDown,
  Code2,
  Package,
  Search,
  ArrowUpRight,
  ArrowLeft,
  ArrowRight,
  ArrowUp,
  Heart,
  Star,
  BadgeCheck,
  Sun,
  Moon,
  Layers,
  Type,
  Palette,
  MousePointerClick,
  Square,
  FormInput,
  Grid3x3,
  Sparkles,
  Code,
  Zap,
  BarChart3,
  Layout,
  Settings2,
  MessageSquare,
  Globe,
  Mail,
} from 'lucide-react';
import './LandingPage.css';

/* ─────────────────────────────────────────────
   DevKit-UI Landing Page
   Adapted from template.html — Electric Blue accent
   Light + Dark theme support
   ───────────────────────────────────────────── */

interface LandingPageProps {
  initialTheme?: 'light' | 'dark';
}

export const LandingPage: React.FC<LandingPageProps> = ({ initialTheme = 'light' }) => {
  const [theme, setTheme] = useState<'light' | 'dark'>(initialTheme);

  const toggleTheme = () => {
    setTheme(prev => (prev === 'light' ? 'dark' : 'light'));
  };

  return (
    <div className="landing-root" data-theme={theme}>
      {/* ══════ TOP UTILITY BAR ══════ */}
      <div className="container">
        <div className="topbar">
          <div className="topbar-logo">
            <div className="topbar-logo-icon">
              <Box size={20} />
            </div>
            <span className="topbar-logo-text display-font">DEVKIT UI</span>
          </div>
          <div className="topbar-info">
            <div>
              <p className="topbar-info-label">GitHub</p>
              <p className="topbar-info-value">FarhanS7/DevKit-UI</p>
            </div>
            <div>
              <p className="topbar-info-label">npm</p>
              <p className="topbar-info-value">@devkit-ui/core</p>
            </div>
          </div>
        </div>
      </div>

      {/* ══════ HERO CARD ══════ */}
      <div className="container">
        <div className="hero-card">
          {/* Hero Nav */}
          <nav className="hero-nav">
            <div className="hero-nav-logo">
              <div className="hero-nav-logo-icon">
                <Box size={20} />
              </div>
              <span className="hero-nav-logo-text display-font">DEVKIT UI</span>
            </div>
            <div className="hero-nav-links">
              <a href="#">Components</a>
              <a href="#">Tokens</a>
              <a href="#">Getting Started</a>
              <a href="#">Playground</a>
              <a href="#">Changelog</a>
              <a href="#">Figma</a>
            </div>
            <div className="hero-nav-actions">
              <button className="btn-ghost" type="button">
                v1.0 <ChevronDown size={16} />
              </button>
              <button
                className="theme-toggle"
                type="button"
                onClick={toggleTheme}
                aria-label="Toggle theme"
              >
                {theme === 'light' ? <Moon size={16} /> : <Sun size={16} />}
              </button>
              <button className="btn-icon btn-icon-accent" type="button" aria-label="View on npm">
                <Package size={16} />
                <span className="btn-badge">5</span>
              </button>
            </div>
          </nav>

          {/* Hero Body */}
          <div className="hero-body">
            <div className="hero-bg-gradient" />
            <div className="hero-bg-glow" />
            <div className="hero-content">
              <p className="hero-subtitle">Production-Ready Components</p>
              <h1 className="hero-title display-font">
                <span className="hero-title-line1">DESIGN &amp;</span>
                <span className="hero-title-line2">COMPONENTS</span>
              </h1>
              <p className="hero-description">
                50+ accessible, customizable React components. Built with TypeScript, powered by
                design tokens, and ready to ship — all in one package.
              </p>

              {/* Search Bar */}
              <div className="search-wrap">
                <div className="search-bar">
                  <button className="search-category" type="button">
                    Components <ChevronDown size={16} />
                  </button>
                  <input
                    type="text"
                    placeholder="Search components, tokens, or docs…"
                    className="search-input"
                  />
                  <button className="search-btn" type="button" aria-label="Search">
                    <Search size={16} />
                  </button>
                </div>
                <p className="search-popular">
                  Popular: <span>Button · Modal · DataTable · Form · Toast</span>
                </p>
              </div>
            </div>
          </div>

          {/* Category Icons Row */}
          <div className="categories">
            <div className="categories-inner">
              <div className="categories-grid">
                {[
                  { icon: <MousePointerClick size={20} />, label: 'Buttons' },
                  { icon: <FormInput size={20} />, label: 'Forms' },
                  { icon: <Layout size={20} />, label: 'Layout' },
                  { icon: <Type size={20} />, label: 'Typography' },
                  { icon: <Palette size={20} />, label: 'Colors' },
                  { icon: <Layers size={20} />, label: 'Overlays' },
                  { icon: <Grid3x3 size={20} />, label: 'Data' },
                  { icon: <Sparkles size={20} />, label: 'Feedback' },
                ].map(cat => (
                  <a href="#" key={cat.label} className="category-item">
                    <div className="category-icon">{cat.icon}</div>
                    <span className="category-label">{cat.label}</span>
                  </a>
                ))}
              </div>
              <a href="#" className="hero-cta">
                <div>
                  <p className="hero-cta-title display-font">50+ NEW</p>
                  <p className="hero-cta-desc">Components just landed in v1.0</p>
                </div>
                <div className="hero-cta-arrow">
                  <ArrowUpRight size={16} />
                </div>
              </a>
            </div>
          </div>
        </div>
      </div>

      {/* ══════ POWERED BY (BRANDS) ══════ */}
      <section className="container brands-section section">
        <p className="section-subtitle">Built With</p>
        <h2 className="section-title display-font">POWERED BY</h2>
        <div className="brands-grid">
          {[
            { icon: <Code size={80} />, label: 'React', bgClass: 'brand-card-bg-1' },
            { icon: <Zap size={80} />, label: 'TypeScript', bgClass: 'brand-card-bg-2' },
            { icon: <Settings2 size={80} />, label: 'Vite', bgClass: 'brand-card-bg-3' },
          ].map(brand => (
            <a href="#" key={brand.label} className="brand-card" style={{ display: 'block' }}>
              <div className={`brand-card-bg ${brand.bgClass}`} />
              <div className="brand-card-ring" />
              <div style={{ position: 'relative', zIndex: 1, textAlign: 'center' }}>
                <div className="brand-card-icon" style={{ display: 'inline-block' }}>
                  {brand.icon}
                </div>
              </div>
              <p
                className="brand-card-label"
                style={{ position: 'relative', zIndex: 1, textAlign: 'center' }}
              >
                {brand.label}
              </p>
            </a>
          ))}
        </div>
      </section>

      {/* ══════ BRAND MARQUEE ══════ */}
      <div className="marquee-section marquee-section-tilted">
        <div className="marquee-band marquee-band-dark">
          <div className="marquee-band-inner marquee-animate">
            {[0, 1].map(i => (
              <span key={i} className="marquee-text marquee-text-white">
                REACT&nbsp;&nbsp;|&nbsp;&nbsp;TYPESCRIPT&nbsp;&nbsp;|&nbsp;&nbsp;VITE&nbsp;&nbsp;|&nbsp;&nbsp;STORYBOOK&nbsp;&nbsp;|&nbsp;&nbsp;FIGMA&nbsp;&nbsp;|&nbsp;&nbsp;A11Y&nbsp;&nbsp;|&nbsp;&nbsp;TOKENS&nbsp;&nbsp;|&nbsp;&nbsp;CSS-IN-JS&nbsp;&nbsp;|&nbsp;&nbsp;
              </span>
            ))}
          </div>
        </div>
        <div className="marquee-band-accent-sub">
          <div className="marquee-band-inner marquee-animate-fast">
            {[0, 1].map(i => (
              <span key={i} className="marquee-text marquee-text-dark">
                BUTTONS&nbsp;&nbsp;|&nbsp;&nbsp;FORMS&nbsp;&nbsp;|&nbsp;&nbsp;MODALS&nbsp;&nbsp;|&nbsp;&nbsp;TABLES&nbsp;&nbsp;|&nbsp;&nbsp;NAVIGATION&nbsp;&nbsp;|&nbsp;&nbsp;FEEDBACK&nbsp;&nbsp;|&nbsp;&nbsp;LAYOUT&nbsp;&nbsp;|&nbsp;&nbsp;DESIGN
                TOKENS&nbsp;&nbsp;|&nbsp;&nbsp;
              </span>
            ))}
          </div>
        </div>
      </div>

      {/* ══════ FEATURED COMPONENTS ══════ */}
      <section className="container cards-section section">
        <div className="section-header">
          <div>
            <p className="section-subtitle">Featured</p>
            <h2 className="section-title display-font">COMPONENTS</h2>
            <a href="#" className="section-link">
              View All Components <ArrowUpRight size={16} />
            </a>
          </div>
          <div className="section-arrows">
            <button className="arrow-btn arrow-btn-outline" type="button" aria-label="Previous">
              <ArrowLeft size={16} />
            </button>
            <button className="arrow-btn arrow-btn-filled" type="button" aria-label="Next">
              <ArrowRight size={16} />
            </button>
          </div>
        </div>

        <div className="cards-grid">
          {/* Card 1 — Button */}
          <div className="product-card product-card-light">
            <div className="card-header">
              <span className="card-badge card-badge-red">HOT</span>
              <button className="card-heart" type="button" aria-label="Favorite">
                <Heart size={16} />
              </button>
            </div>
            <div className="card-icon-area">
              <MousePointerClick size={96} className="card-icon card-icon-rotate" />
            </div>
            <p className="card-name">
              Button
              <br />
              Component
            </p>
            <p className="card-price display-font">
              12 Variants <span className="card-price-unit">API</span>
            </p>
            <div className="card-stock">
              <span className="stock-dot stock-dot-green" /> Stable
            </div>
          </div>

          {/* Card 2 — Modal (Featured) */}
          <div className="product-card product-card-dark">
            <div className="product-card-glow" />
            <div className="card-header">
              <span className="card-badge card-badge-accent">FEATURED</span>
              <button
                className="card-heart"
                type="button"
                aria-label="Favorite"
                style={{ color: '#64748b' }}
              >
                <Heart size={16} />
              </button>
            </div>
            <div className="card-icon-area">
              <Layers size={96} className="card-icon" />
            </div>
            <p className="card-name">
              Modal &amp; Dialog
              <br />
              System
            </p>
            <p className="card-price display-font">
              8 Variants <span className="card-price-unit">API</span>
            </p>
            <div className="card-stock">
              <span className="stock-dot stock-dot-green" /> Stable
            </div>
          </div>

          {/* Card 3 — DataTable */}
          <div className="product-card product-card-light">
            <div className="card-header">
              <span className="card-badge card-badge-muted">NEW</span>
              <button className="card-heart" type="button" aria-label="Favorite">
                <Heart size={16} />
              </button>
            </div>
            <div className="card-icon-area">
              <Grid3x3 size={96} className="card-icon" />
            </div>
            <p className="card-name">
              DataTable
              <br />
              Sortable &amp; Filterable
            </p>
            <p className="card-price display-font">
              6 Variants <span className="card-price-unit">API</span>
            </p>
            <div className="card-stock">
              <span className="stock-dot stock-dot-green" /> Stable
            </div>
          </div>

          {/* Card 4 — Toast */}
          <div className="product-card product-card-light">
            <div className="card-header">
              <span className="card-badge card-badge-muted">v1.0</span>
              <button className="card-heart" type="button" aria-label="Favorite">
                <Heart size={16} />
              </button>
            </div>
            <div className="card-icon-area">
              <Sparkles size={96} className="card-icon" />
            </div>
            <p className="card-name">
              Toast &amp; Notification
              <br />
              System
            </p>
            <p className="card-price display-font">
              5 Variants <span className="card-price-unit">API</span>
            </p>
            <div className="card-stock">
              <span className="stock-dot stock-dot-amber" /> Beta
            </div>
          </div>
        </div>
      </section>

      {/* ══════ DESIGN TOKENS ══════ */}
      <section className="container cards-section section" style={{ paddingTop: '5rem' }}>
        <div className="section-header">
          <div>
            <p className="section-subtitle">Foundation</p>
            <h2 className="section-title display-font">DESIGN TOKENS</h2>
            <a href="#" className="section-link">
              Browse Token Reference <ArrowUpRight size={16} />
            </a>
          </div>
          <div className="section-arrows">
            <button className="arrow-btn arrow-btn-outline" type="button" aria-label="Previous">
              <ArrowLeft size={16} />
            </button>
            <button className="arrow-btn arrow-btn-filled" type="button" aria-label="Next">
              <ArrowRight size={16} />
            </button>
          </div>
        </div>

        <div className="cards-grid">
          {/* Token Card 1 — Colors */}
          <div className="product-card product-card-light">
            <div className="card-icon-area">
              <Palette size={96} className="card-icon card-icon-rotate" />
            </div>
            <p className="card-name">
              Color Palette
              <br />
              Semantic &amp; Raw
            </p>
            <p className="card-price display-font">
              48 Tokens <span className="card-price-unit">CSS</span>
            </p>
            <div className="card-variants">
              <span className="variant-dot" style={{ background: '#0f172a' }} />
              <span className="variant-dot" style={{ background: '#3b82f6' }} />
              <span className="variant-dot" style={{ background: '#94a3b8' }} />
            </div>
          </div>

          {/* Token Card 2 — Typography */}
          <div className="product-card product-card-light">
            <div className="card-icon-area">
              <Type size={96} className="card-icon" />
            </div>
            <p className="card-name">
              Typography Scale
              <br />
              Fluid &amp; Responsive
            </p>
            <p className="card-price display-font">
              16 Tokens <span className="card-price-unit">CSS</span>
            </p>
            <div className="card-variants">
              <span className="variant-dot" style={{ background: '#0f172a' }} />
              <span className="variant-dot" style={{ background: '#3b82f6' }} />
            </div>
          </div>

          {/* Token Card 3 — Spacing */}
          <div className="product-card product-card-light" style={{ position: 'relative' }}>
            <span
              className="card-badge card-badge-red"
              style={{ position: 'absolute', top: '1.25rem', left: '1.25rem' }}
            >
              CORE
            </span>
            <div className="card-icon-area">
              <Square size={96} className="card-icon" />
            </div>
            <p className="card-name">
              Spacing System
              <br />
              4px Grid
            </p>
            <p className="card-price display-font">
              12 Tokens <span className="card-price-unit">CSS</span>
            </p>
            <div className="card-variants">
              <span className="variant-dot" style={{ background: '#0f172a' }} />
              <span className="variant-dot" style={{ background: '#f59e0b' }} />
            </div>
          </div>

          {/* Token Card 4 — Shadows */}
          <div className="product-card product-card-light">
            <div className="card-icon-area">
              <BarChart3 size={96} className="card-icon" />
            </div>
            <p className="card-name">
              Elevation &amp; Shadows
              <br />5 Levels
            </p>
            <p className="card-price display-font">
              10 Tokens <span className="card-price-unit">CSS</span>
            </p>
            <div className="card-variants">
              <span className="variant-dot" style={{ background: '#0f172a' }} />
              <span className="variant-dot" style={{ background: '#10b981' }} />
            </div>
          </div>
        </div>
      </section>

      {/* ══════ OFFER MARQUEE ══════ */}
      <div className="marquee-section marquee-section-tilted-reverse" style={{ marginTop: '5rem' }}>
        <div className="marquee-band marquee-band-accent">
          <div className="marquee-band-inner marquee-animate-fastest">
            {[0, 1].map(i => (
              <span key={i} className="marquee-text marquee-text-dark marquee-text-large">
                50+ COMPONENTS&nbsp;&nbsp;|&nbsp;&nbsp;50+ COMPONENTS&nbsp;&nbsp;|&nbsp;&nbsp;50+
                COMPONENTS&nbsp;&nbsp;|&nbsp;&nbsp;50+ COMPONENTS&nbsp;&nbsp;|&nbsp;&nbsp;
              </span>
            ))}
          </div>
        </div>
        <div className="marquee-band-dark-sub">
          <div className="marquee-band-inner marquee-animate-slow">
            {[0, 1].map(i => (
              <span key={i} className="marquee-text marquee-text-white marquee-text-large">
                SHIP FASTER WITH DEVKIT&nbsp;&nbsp;|&nbsp;&nbsp;SHIP FASTER WITH
                DEVKIT&nbsp;&nbsp;|&nbsp;&nbsp;SHIP FASTER WITH DEVKIT&nbsp;&nbsp;|&nbsp;&nbsp;
              </span>
            ))}
          </div>
        </div>
      </div>

      {/* ══════ TESTIMONIALS ══════ */}
      <section className="container testimonials-section section">
        <div className="section-header">
          <div>
            <p className="section-subtitle">Trusted By</p>
            <h2 className="section-title display-font">DEVELOPERS</h2>
          </div>
          <div className="section-arrows">
            <button className="arrow-btn arrow-btn-outline" type="button" aria-label="Previous">
              <ArrowLeft size={16} />
            </button>
            <button className="arrow-btn arrow-btn-filled" type="button" aria-label="Next">
              <ArrowRight size={16} />
            </button>
          </div>
        </div>

        <div className="testimonials-grid">
          {/* Testimonial 1 */}
          <div className="testimonial-card testimonial-card-light">
            <div className="stars">
              {[...Array(5)].map((_, i) => (
                <Star key={i} size={16} className="star-gold" fill="currentColor" />
              ))}
            </div>
            <p className="testimonial-text">
              DevKit UI saved us weeks of work. The component API is intuitive, accessibility is
              built-in, and the design tokens made our brand integration seamless. Best DX I've
              experienced.
            </p>
            <div className="testimonial-author">
              <div className="author-avatar author-avatar-dark">SR</div>
              <div>
                <p className="author-name">Sarah Rodriguez</p>
                <p className="author-role">
                  <BadgeCheck size={14} className="verified-icon" /> Sr. Frontend Engineer
                </p>
              </div>
            </div>
          </div>

          {/* Testimonial 2 (featured dark) */}
          <div className="testimonial-card testimonial-card-dark">
            <div className="stars">
              {[...Array(5)].map((_, i) => (
                <Star key={i} size={16} className="star-accent" fill="currentColor" />
              ))}
            </div>
            <p className="testimonial-text">
              We migrated from a custom component library to DevKit UI. The TypeScript types are
              rock-solid, the Storybook docs are comprehensive, and the token system let us keep our
              exact brand colors. Our team ships 3x faster now.
            </p>
            <div className="testimonial-author">
              <div className="author-avatar author-avatar-accent">AK</div>
              <div>
                <p className="author-name">Alex Kim</p>
                <p className="author-role">
                  <BadgeCheck size={14} className="verified-icon" /> Tech Lead, Startup
                </p>
              </div>
            </div>
          </div>

          {/* Testimonial 3 */}
          <div className="testimonial-card testimonial-card-light">
            <div className="stars">
              {[...Array(4)].map((_, i) => (
                <Star key={i} size={16} className="star-gold" fill="currentColor" />
              ))}
              <Star size={16} className="star-gold" />
            </div>
            <p className="testimonial-text">
              The accessibility features are exceptional. Every component passes WCAG AA out of the
              box. The dark mode support with design tokens made our app feel polished on day one.
            </p>
            <div className="testimonial-author">
              <div className="author-avatar author-avatar-dark">MJ</div>
              <div>
                <p className="author-name">Maria Johnson</p>
                <p className="author-role">
                  <BadgeCheck size={14} className="verified-icon" /> Design Systems Lead
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ══════ COMPONENT SHOWCASE (GALLERY) ══════ */}
      <section className="container gallery-section section">
        <div className="gallery-header">
          <h2 className="gallery-title display-font">Showcase</h2>
          <a href="#" className="gallery-link">
            Explore Storybook
            <span className="gallery-link-arrow">
              <ArrowUpRight size={16} />
            </span>
          </a>
        </div>

        <div className="gallery-grid">
          <div className="gallery-item gallery-item-bg-1">
            <MousePointerClick size={64} className="gallery-item-icon gallery-item-icon-rotate" />
          </div>
          <div className="gallery-item gallery-item-bg-2 gallery-item-offset">
            <Layers size={64} className="gallery-item-icon" />
          </div>
          <div className="gallery-item gallery-item-bg-3">
            <Grid3x3 size={64} className="gallery-item-icon gallery-item-icon-spin" />
          </div>
          <div className="gallery-item gallery-item-bg-4 gallery-item-offset">
            <BarChart3 size={64} className="gallery-item-icon" />
          </div>
        </div>
      </section>

      {/* ══════ SPECIALIST BANNER ══════ */}
      <div className="specialist-banner">
        <div className="specialist-banner-inner">
          <p className="specialist-banner-sub">
            More than just a <strong>component library</strong>
          </p>
          <p className="specialist-banner-title display-font">BUILT FOR DEVELOPERS</p>
        </div>
      </div>

      {/* ══════ FOOTER ══════ */}
      <footer className="container footer">
        <div className="footer-card">
          <div className="footer-grid">
            {/* Brand column */}
            <div>
              <div className="footer-brand">
                <div className="footer-brand-icon">
                  <Box size={20} />
                </div>
                <span className="footer-brand-name display-font">DEVKIT UI</span>
              </div>
              <p className="footer-desc">
                A production-ready React component library with design tokens, accessibility
                built-in, and a developer experience that sparks joy. Ship beautiful interfaces
                faster.
              </p>
              <div className="footer-social">
                <a href="#" className="social-link" aria-label="GitHub">
                  <Code2 size={16} />
                </a>
                <a href="#" className="social-link" aria-label="Twitter">
                  <Globe size={16} />
                </a>
                <a href="#" className="social-link" aria-label="Discord">
                  <MessageSquare size={16} />
                </a>
                <a href="#" className="social-link" aria-label="Email">
                  <Mail size={16} />
                </a>
              </div>
            </div>

            {/* Docs column */}
            <div>
              <p className="footer-col-title">Documentation</p>
              <ul className="footer-col-list">
                <li>
                  <a href="#">Getting Started</a>
                </li>
                <li>
                  <a href="#">Component API</a>
                </li>
                <li>
                  <a href="#">Design Tokens</a>
                </li>
                <li>
                  <a href="#">Theming Guide</a>
                </li>
              </ul>
            </div>

            {/* Resources column */}
            <div>
              <p className="footer-col-title">Resources</p>
              <ul className="footer-col-list">
                <li>
                  <a href="#">Storybook</a>
                </li>
                <li>
                  <a href="#">Figma Kit</a>
                </li>
                <li>
                  <a href="#">GitHub Repo</a>
                </li>
                <li>
                  <a href="#">Changelog</a>
                </li>
              </ul>
            </div>

            {/* Community column */}
            <div>
              <p className="footer-col-title">Community</p>
              <ul className="footer-col-list">
                <li>
                  <a href="#">Discord</a>
                </li>
                <li>
                  <a href="#">Contributing</a>
                </li>
                <li>
                  <a href="#">Code of Conduct</a>
                </li>
                <li>
                  <a href="#">MIT License</a>
                </li>
              </ul>
            </div>
          </div>

          <div className="footer-bottom">
            <p className="footer-copyright">© 2026 DevKit UI. All rights reserved.</p>
            <button
              className="footer-back-top"
              type="button"
              onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}
            >
              Back To Top <ArrowUp size={14} />
            </button>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default LandingPage;
