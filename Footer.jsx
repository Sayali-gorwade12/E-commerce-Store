import React from 'react';
import { Link } from 'react-router-dom';
import { ShoppingBag, ShieldCheck, Truck, RotateCcw, CreditCard, Mail, Phone, MapPin } from 'lucide-react';

export default function Footer() {
  return (
    <footer className="footer">
      <div className="container">
        {/* Value Proposition Badges */}
        <div
          style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))',
            gap: '1.5rem',
            paddingBottom: '2.5rem',
            borderBottom: '1px solid #1e293b',
            marginBottom: '3rem'
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.85rem' }}>
            <div style={{ background: 'rgba(37, 99, 235, 0.2)', padding: '0.6rem', borderRadius: 'var(--radius-md)', color: '#60a5fa' }}>
              <Truck size={22} />
            </div>
            <div>
              <div style={{ fontWeight: 700, color: 'white', fontSize: '0.95rem' }}>Fast Delivery</div>
              <div style={{ color: '#94a3b8', fontSize: '0.82rem' }}>Free shipping on orders over ₹999</div>
            </div>
          </div>

          <div style={{ display: 'flex', alignItems: 'center', gap: '0.85rem' }}>
            <div style={{ background: 'rgba(16, 185, 129, 0.2)', padding: '0.6rem', borderRadius: 'var(--radius-md)', color: '#34d399' }}>
              <ShieldCheck size={22} />
            </div>
            <div>
              <div style={{ fontWeight: 700, color: 'white', fontSize: '0.95rem' }}>Verified Quality</div>
              <div style={{ color: '#94a3b8', fontSize: '0.82rem' }}>100% authentic curated products</div>
            </div>
          </div>

          <div style={{ display: 'flex', alignItems: 'center', gap: '0.85rem' }}>
            <div style={{ background: 'rgba(245, 158, 11, 0.2)', padding: '0.6rem', borderRadius: 'var(--radius-md)', color: '#fbbf24' }}>
              <RotateCcw size={22} />
            </div>
            <div>
              <div style={{ fontWeight: 700, color: 'white', fontSize: '0.95rem' }}>Easy Returns</div>
              <div style={{ color: '#94a3b8', fontSize: '0.82rem' }}>7-day hassle-free replacement</div>
            </div>
          </div>

          <div style={{ display: 'flex', alignItems: 'center', gap: '0.85rem' }}>
            <div style={{ background: 'rgba(168, 85, 247, 0.2)', padding: '0.6rem', borderRadius: 'var(--radius-md)', color: '#c084fc' }}>
              <CreditCard size={22} />
            </div>
            <div>
              <div style={{ fontWeight: 700, color: 'white', fontSize: '0.95rem' }}>Payment Choices</div>
              <div style={{ color: '#94a3b8', fontSize: '0.82rem' }}>Cash on Delivery & Demo Pay</div>
            </div>
          </div>
        </div>

        {/* Main Footer Links */}
        <div className="footer-grid">
          <div className="footer-brand">
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.75rem' }}>
              <ShoppingBag size={24} style={{ color: '#60a5fa' }} />
              <h3 style={{ margin: 0 }}>ShopSphere</h3>
            </div>
            <p>
              Your modern, reliable destination for curated electronics, timeless fashion, home essentials, and lifestyle accessories.
            </p>
          </div>

          <div className="footer-col">
            <h4>Quick Links</h4>
            <ul className="footer-links">
              <li><Link to="/">Home</Link></li>
              <li><Link to="/products">All Products</Link></li>
              <li><Link to="/cart">Shopping Cart</Link></li>
              <li><Link to="/orders">My Orders</Link></li>
            </ul>
          </div>

          <div className="footer-col">
            <h4>Categories</h4>
            <ul className="footer-links">
              <li><Link to="/products?category=Electronics">Electronics</Link></li>
              <li><Link to="/products?category=Fashion">Fashion</Link></li>
              <li><Link to="/products?category=Home+%26+Living">Home & Living</Link></li>
              <li><Link to="/products?category=Accessories">Accessories</Link></li>
            </ul>
          </div>

          <div className="footer-col">
            <h4>Customer Support</h4>
            <ul className="footer-links" style={{ color: '#94a3b8', fontSize: '0.9rem' }}>
              <li style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.6rem' }}>
                <Mail size={16} style={{ color: '#60a5fa' }} />
                <span>support@shopsphere.com</span>
              </li>
              <li style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.6rem' }}>
                <Phone size={16} style={{ color: '#60a5fa' }} />
                <span>+91 1800-123-7467</span>
              </li>
              <li style={{ display: 'flex', alignItems: 'flex-start', gap: '0.5rem' }}>
                <MapPin size={16} style={{ color: '#60a5fa', marginTop: '2px', flexShrink: 0 }} />
                <span>Bengaluru, Karnataka, India</span>
              </li>
            </ul>
          </div>
        </div>

        {/* Footer Bottom */}
        <div className="footer-bottom">
          <div>
            &copy; {new Date().getFullYear()} ShopSphere. All rights reserved.
          </div>
          <div style={{ display: 'flex', gap: '1.5rem' }}>
            <span>Privacy Policy</span>
            <span>Terms of Service</span>
            <span>Security</span>
          </div>
        </div>
      </div>
    </footer>
  );
}
