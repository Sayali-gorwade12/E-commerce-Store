import React, { useState } from 'react';
import { Link, NavLink, useNavigate } from 'react-router-dom';
import { ShoppingBag, ShoppingCart, User, LogOut, Package, Menu, X } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { useCart } from '../context/CartContext';

export default function Navbar() {
  const { user, isAuthenticated, logout } = useAuth();
  const { cartCount } = useCart();
  const navigate = useNavigate();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const handleLogout = () => {
    logout();
    navigate('/login');
    setMobileMenuOpen(false);
  };

  return (
    <nav className="navbar">
      <div className="container nav-inner">
        {/* Brand Logo */}
        <Link to="/" className="brand-logo" onClick={() => setMobileMenuOpen(false)}>
          <ShoppingBag className="brand-icon" />
          <span>ShopSphere</span>
        </Link>

        {/* Desktop Navigation Links */}
        <div className="nav-links" style={{ display: 'flex' }}>
          <NavLink to="/" className={({ isActive }) => `nav-link ${isActive ? 'active' : ''}`} end>
            Home
          </NavLink>
          <NavLink to="/products" className={({ isActive }) => `nav-link ${isActive ? 'active' : ''}`}>
            All Products
          </NavLink>
        </div>

        {/* Right Actions */}
        <div className="nav-actions">
          {/* Cart Icon */}
          <Link to="/cart" className="cart-button" title="View Shopping Cart">
            <ShoppingCart size={20} />
            {cartCount > 0 && <span className="cart-badge">{cartCount}</span>}
          </Link>

          {/* User Section (Desktop) */}
          {isAuthenticated ? (
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
              <Link to="/orders" className="btn btn-sm btn-secondary" title="View my past orders">
                <Package size={15} />
                <span>My Orders</span>
              </Link>
              <Link to="/profile" className="btn btn-sm btn-secondary" title="My profile">
                <User size={15} />
                <span>{user?.name?.split(' ')[0] || 'Profile'}</span>
              </Link>
              <button
                type="button"
                onClick={handleLogout}
                className="btn btn-sm"
                style={{ color: 'var(--text-muted)' }}
                title="Log out"
              >
                <LogOut size={16} />
              </button>
            </div>
          ) : (
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem' }}>
              <Link to="/login" className="btn btn-sm btn-secondary">
                Log In
              </Link>
              <Link to="/register" className="btn btn-sm btn-primary">
                Register
              </Link>
            </div>
          )}

          {/* Mobile Menu Toggle Button */}
          <button
            type="button"
            className="btn btn-sm btn-secondary"
            style={{ display: 'none' }}
            id="mobile-menu-btn"
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            aria-label="Toggle menu"
          >
            {mobileMenuOpen ? <X size={20} /> : <Menu size={20} />}
          </button>
        </div>
      </div>

      {/* Mobile Drawer (if open) */}
      {mobileMenuOpen && (
        <div
          style={{
            background: 'white',
            borderBottom: '1px solid var(--border)',
            padding: '1rem 1.25rem',
            display: 'flex',
            flexDirection: 'column',
            gap: '0.75rem'
          }}
        >
          <Link to="/" onClick={() => setMobileMenuOpen(false)} className="nav-link">
            Home
          </Link>
          <Link to="/products" onClick={() => setMobileMenuOpen(false)} className="nav-link">
            All Products
          </Link>
          <Link to="/cart" onClick={() => setMobileMenuOpen(false)} className="nav-link">
            Cart ({cartCount})
          </Link>
          {isAuthenticated ? (
            <>
              <Link to="/orders" onClick={() => setMobileMenuOpen(false)} className="nav-link">
                My Orders
              </Link>
              <Link to="/profile" onClick={() => setMobileMenuOpen(false)} className="nav-link">
                Profile ({user?.name})
              </Link>
              <button
                type="button"
                onClick={handleLogout}
                className="btn btn-danger btn-sm"
                style={{ alignSelf: 'flex-start' }}
              >
                Log Out
              </button>
            </>
          ) : (
            <div style={{ display: 'flex', gap: '0.5rem', marginTop: '0.5rem' }}>
              <Link to="/login" onClick={() => setMobileMenuOpen(false)} className="btn btn-secondary btn-sm">
                Log In
              </Link>
              <Link to="/register" onClick={() => setMobileMenuOpen(false)} className="btn btn-primary btn-sm">
                Register
              </Link>
            </div>
          )}
        </div>
      )}
    </nav>
  );
}
