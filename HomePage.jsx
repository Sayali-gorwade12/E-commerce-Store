import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { ArrowRight, Sparkles, TrendingUp, ShieldCheck, Headphones, Smartphone, Shirt, Home, Watch, Lock } from 'lucide-react';
import ProductGrid from '../components/ProductGrid';
import LoadingSpinner from '../components/LoadingSpinner';
import ErrorMessage from '../components/ErrorMessage';
import api from '../services/api';

export default function HomePage() {
  const [featuredProducts, setFeaturedProducts] = useState([]);
  const [popularProducts, setPopularProducts] = useState([]);
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    async function loadHomeData() {
      try {
        setLoading(true);
        setError(null);

        const [productsRes, categoriesRes] = await Promise.all([
          api.get('/products?limit=12'),
          api.get('/categories')
        ]);

        if (productsRes.data?.success) {
          const prods = productsRes.data.data;
          setFeaturedProducts(prods.slice(0, 4));
          setPopularProducts(prods.slice(4, 8));
        }

        if (categoriesRes.data?.success) {
          setCategories(categoriesRes.data.data);
        }
      } catch (err) {
        setError(err.response?.data?.message || 'Failed to connect to ShopSphere server.');
      } finally {
        setLoading(false);
      }
    }

    loadHomeData();
  }, []);

  const getCategoryIcon = (name) => {
    switch (name) {
      case 'Electronics': return <Smartphone size={24} />;
      case 'Fashion': return <Shirt size={24} />;
      case 'Home & Living': return <Home size={24} />;
      case 'Accessories': return <Watch size={24} />;
      default: return <Sparkles size={24} />;
    }
  };

  return (
    <div className="container">
      {/* Hero Section */}
      <section className="hero-section">
        <div className="container hero-inner">
          <div>
            <span className="hero-tagline">
              <Sparkles size={14} style={{ display: 'inline', marginRight: '6px' }} />
              Curated Lifestyle & Essentials
            </span>
            <h1 className="hero-title">
              Elevate Your Daily Living with <span>ShopSphere</span>
            </h1>
            <p className="hero-subtitle">
              Explore handpicked, high-grade essentials across modern electronics, breathable apparel, artisanal home décor, and luxury accessories.
            </p>
            <div className="hero-actions">
              <Link to="/products" className="btn btn-primary btn-lg">
                Explore All Products
                <ArrowRight size={18} />
              </Link>
              <Link to="/register" className="btn btn-secondary btn-lg">
                Create Free Account
              </Link>
            </div>
          </div>

          <div className="hero-badge-grid">
            <div className="hero-feature-card">
              <h4>100% Genuine</h4>
              <p>Directly verified authentic stock with full warranty protection.</p>
            </div>
            <div className="hero-feature-card">
              <h4>Free Shipping</h4>
              <p>Complimentary delivery on all retail orders exceeding ₹999.</p>
            </div>
            <div className="hero-feature-card">
              <h4>Cash on Delivery</h4>
              <p>Pay comfortably at your doorstep when your parcel arrives.</p>
            </div>
            <div className="hero-feature-card">
              <h4>Secure Checkout</h4>
              <p>Protected order handling with buyer satisfaction guarantee.</p>
            </div>
          </div>
        </div>
      </section>

      {error && <ErrorMessage message={error} />}

      {/* Categories Section */}
      <section style={{ margin: '3.5rem 0' }}>
        <div className="section-title-wrap">
          <div>
            <h2 className="section-title">Shop by Category</h2>
            <p className="section-subtitle">Curated collections organized for effortless shopping</p>
          </div>
        </div>

        <div
          style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))',
            gap: '1.25rem'
          }}
        >
          {categories.map((cat) => (
            <Link
              key={cat.category}
              to={`/products?category=${encodeURIComponent(cat.category)}`}
              className="card"
              style={{
                padding: '1.5rem',
                display: 'flex',
                alignItems: 'center',
                gap: '1rem',
                transition: 'all 0.2s ease',
                textDecoration: 'none'
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.transform = 'translateY(-3px)';
                e.currentTarget.style.borderColor = 'var(--primary-border)';
                e.currentTarget.style.boxShadow = 'var(--shadow-hover)';
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.transform = 'translateY(0)';
                e.currentTarget.style.borderColor = 'var(--border)';
                e.currentTarget.style.boxShadow = 'var(--shadow-sm)';
              }}
            >
              <div
                style={{
                  background: 'var(--primary-light)',
                  color: 'var(--primary)',
                  padding: '0.85rem',
                  borderRadius: 'var(--radius-md)'
                }}
              >
                {getCategoryIcon(cat.category)}
              </div>
              <div>
                <h3 style={{ fontSize: '1.05rem', fontWeight: 700, color: 'var(--text-main)' }}>
                  {cat.category}
                </h3>
                <span style={{ fontSize: '0.82rem', color: 'var(--text-muted)' }}>
                  {cat.count} {cat.count === 1 ? 'Product' : 'Products'}
                </span>
              </div>
            </Link>
          ))}
        </div>
      </section>

      {/* Featured Products */}
      <section style={{ margin: '3.5rem 0' }}>
        <div className="section-title-wrap">
          <div>
            <h2 className="section-title">Featured Highlights</h2>
            <p className="section-subtitle">Top-rated items handpicked for quality and craftsmanship</p>
          </div>
          <Link to="/products" className="btn btn-outline btn-sm">
            View All ({featuredProducts.length + popularProducts.length}+)
            <ArrowRight size={14} />
          </Link>
        </div>

        <ProductGrid products={featuredProducts} loading={loading} />
      </section>

      {/* Promotional Value Banner */}
      <section
        style={{
          background: 'linear-gradient(135deg, #eff6ff 0%, #dbeafe 100%)',
          border: '1px solid #bfdbfe',
          borderRadius: 'var(--radius-lg)',
          padding: '2.5rem',
          margin: '3.5rem 0',
          display: 'flex',
          flexWrap: 'wrap',
          alignItems: 'center',
          justifyContent: 'space-between',
          gap: '1.5rem'
        }}
      >
        <div style={{ maxWidth: '600px' }}>
          <span style={{ color: 'var(--primary)', fontWeight: 700, fontSize: '0.85rem', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
            Special Shopping Offer
          </span>
          <h3 style={{ fontSize: '1.75rem', fontWeight: 800, color: '#1e3a8a', marginTop: '0.25rem', marginBottom: '0.5rem' }}>
            Enjoy Free Express Shipping on Every Order Over ₹999
          </h3>
          <p style={{ color: '#3b82f6', fontSize: '0.95rem' }}>
            No coupons or secret codes needed. Eligible orders automatically update shipping charges to ₹0 during checkout.
          </p>
        </div>
        <Link to="/products" className="btn btn-primary btn-lg">
          Shop Now
        </Link>
      </section>

      {/* Popular Products */}
      <section style={{ margin: '3.5rem 0' }}>
        <div className="section-title-wrap">
          <div>
            <h2 className="section-title">Trending This Week</h2>
            <p className="section-subtitle">Customers love these bestselling choices</p>
          </div>
          <Link to="/products?sort=newest" className="btn btn-outline btn-sm">
            Explore Trends
            <ArrowRight size={14} />
          </Link>
        </div>

        <ProductGrid products={popularProducts} loading={loading} />
      </section>
    </div>
  );
}
