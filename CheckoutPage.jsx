import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { ShieldCheck, Truck, CreditCard, Banknote, ArrowLeft, CheckCircle2 } from 'lucide-react';
import { useCart } from '../context/CartContext';
import { useAuth } from '../context/AuthContext';
import ErrorMessage from '../components/ErrorMessage';
import api from '../services/api';

export default function CheckoutPage() {
  const { items, clearCart, cartCount, subtotal, shippingFee, total, formatPrice } = useCart();
  const { user } = useAuth();
  const navigate = useNavigate();

  const [formData, setFormData] = useState({
    customer_name: user?.name || '',
    phone: '',
    shipping_address: '',
    city: '',
    state: '',
    postal_code: '',
    payment_method: 'Cash on Delivery'
  });

  const [errors, setErrors] = useState({});
  const [serverError, setServerError] = useState(null);
  const [submitting, setSubmitting] = useState(false);

  if (items.length === 0) {
    return (
      <div className="container" style={{ padding: '3.5rem 1.25rem', textAlign: 'center' }}>
        <h2>Your cart is empty</h2>
        <p style={{ color: 'var(--text-muted)', marginTop: '0.5rem', marginBottom: '1.5rem' }}>
          Please add items to your cart before proceeding to checkout.
        </p>
        <Link to="/products" className="btn btn-primary">
          Browse Products
        </Link>
      </div>
    );
  }

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
    if (errors[e.target.name]) {
      setErrors({ ...errors, [e.target.name]: null });
    }
  };

  const validate = () => {
    const errs = {};
    if (!formData.customer_name.trim()) errs.customer_name = 'Recipient name is required.';
    if (!formData.phone.trim()) {
      errs.phone = 'Contact phone number is required.';
    } else if (formData.phone.trim().length < 8) {
      errs.phone = 'Please enter a valid phone number.';
    }
    if (!formData.shipping_address.trim()) errs.shipping_address = 'Delivery address is required.';
    if (!formData.city.trim()) errs.city = 'City is required.';
    if (!formData.state.trim()) errs.state = 'State is required.';
    if (!formData.postal_code.trim()) errs.postal_code = 'Postal / PIN code is required.';

    return errs;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setServerError(null);

    const validationErrors = validate();
    if (Object.keys(validationErrors).length > 0) {
      setErrors(validationErrors);
      return;
    }

    try {
      setSubmitting(true);

      const orderPayload = {
        customer_name: formData.customer_name.trim(),
        phone: formData.phone.trim(),
        shipping_address: formData.shipping_address.trim(),
        city: formData.city.trim(),
        state: formData.state.trim(),
        postal_code: formData.postal_code.trim(),
        payment_method: formData.payment_method,
        items: items.map((it) => ({
          product_id: it.id,
          quantity: it.quantity
        }))
      };

      const res = await api.post('/orders', orderPayload);

      if (res.data?.success && res.data?.data) {
        const orderData = res.data.data;
        clearCart();
        navigate(`/order-confirmation/${orderData.order_number}`, {
          state: { order: orderData }
        });
      }
    } catch (err) {
      setServerError(
        err.response?.data?.message ||
        'Failed to process your order. Please check stock availability and try again.'
      );
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="container" style={{ padding: '2rem 1.25rem' }}>
      <div style={{ marginBottom: '1.5rem' }}>
        <Link to="/cart" style={{ display: 'inline-flex', alignItems: 'center', gap: '0.4rem', color: 'var(--text-muted)', fontSize: '0.9rem', marginBottom: '0.75rem' }}>
          <ArrowLeft size={16} />
          Return to Shopping Cart
        </Link>
        <h1 style={{ fontSize: '2rem', fontWeight: 800, color: 'var(--text-main)', letterSpacing: '-0.02em' }}>
          Secure Checkout
        </h1>
        <p style={{ color: 'var(--text-muted)', fontSize: '0.95rem' }}>
          Provide your shipping details to complete your order
        </p>
      </div>

      {serverError && <ErrorMessage message={serverError} />}

      <form onSubmit={handleSubmit} noValidate>
        <div
          style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))',
            gap: '2.5rem',
            alignItems: 'start'
          }}
        >
          {/* Shipping and Payment Column */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: '1.75rem' }}>
            {/* Delivery Details Card */}
            <div
              style={{
                background: 'white',
                borderRadius: 'var(--radius-lg)',
                border: '1px solid var(--border)',
                padding: '1.75rem',
                boxShadow: 'var(--shadow-sm)'
              }}
            >
              <h2 style={{ fontSize: '1.25rem', fontWeight: 700, marginBottom: '1.25rem', color: 'var(--text-main)', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                <Truck size={20} style={{ color: 'var(--primary)' }} />
                1. Delivery Address
              </h2>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
                <div className="form-group">
                  <label className="form-label" htmlFor="customer_name">
                    Recipient Full Name *
                  </label>
                  <input
                    type="text"
                    id="customer_name"
                    name="customer_name"
                    value={formData.customer_name}
                    onChange={handleChange}
                    placeholder="e.g. Arjun Sharma"
                    className={`form-input ${errors.customer_name ? 'has-error' : ''}`}
                    disabled={submitting}
                  />
                  {errors.customer_name && <div className="form-error">{errors.customer_name}</div>}
                </div>

                <div className="form-group">
                  <label className="form-label" htmlFor="phone">
                    Contact Phone Number *
                  </label>
                  <input
                    type="tel"
                    id="phone"
                    name="phone"
                    value={formData.phone}
                    onChange={handleChange}
                    placeholder="e.g. +91 98765 43210"
                    className={`form-input ${errors.phone ? 'has-error' : ''}`}
                    disabled={submitting}
                  />
                  {errors.phone && <div className="form-error">{errors.phone}</div>}
                </div>
              </div>

              <div className="form-group">
                <label className="form-label" htmlFor="shipping_address">
                  Street Address & House / Flat No. *
                </label>
                <textarea
                  id="shipping_address"
                  name="shipping_address"
                  rows={2}
                  value={formData.shipping_address}
                  onChange={handleChange}
                  placeholder="e.g. Flat 402, Lotus Residency, 42 MG Road"
                  className={`form-textarea ${errors.shipping_address ? 'has-error' : ''}`}
                  disabled={submitting}
                />
                {errors.shipping_address && <div className="form-error">{errors.shipping_address}</div>}
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '1rem' }}>
                <div className="form-group">
                  <label className="form-label" htmlFor="city">
                    City *
                  </label>
                  <input
                    type="text"
                    id="city"
                    name="city"
                    value={formData.city}
                    onChange={handleChange}
                    placeholder="e.g. Bengaluru"
                    className={`form-input ${errors.city ? 'has-error' : ''}`}
                    disabled={submitting}
                  />
                  {errors.city && <div className="form-error">{errors.city}</div>}
                </div>

                <div className="form-group">
                  <label className="form-label" htmlFor="state">
                    State *
                  </label>
                  <input
                    type="text"
                    id="state"
                    name="state"
                    value={formData.state}
                    onChange={handleChange}
                    placeholder="e.g. Karnataka"
                    className={`form-input ${errors.state ? 'has-error' : ''}`}
                    disabled={submitting}
                  />
                  {errors.state && <div className="form-error">{errors.state}</div>}
                </div>

                <div className="form-group">
                  <label className="form-label" htmlFor="postal_code">
                    Postal / PIN Code *
                  </label>
                  <input
                    type="text"
                    id="postal_code"
                    name="postal_code"
                    value={formData.postal_code}
                    onChange={handleChange}
                    placeholder="e.g. 560038"
                    className={`form-input ${errors.postal_code ? 'has-error' : ''}`}
                    disabled={submitting}
                  />
                  {errors.postal_code && <div className="form-error">{errors.postal_code}</div>}
                </div>
              </div>
            </div>

            {/* Payment Method Card */}
            <div
              style={{
                background: 'white',
                borderRadius: 'var(--radius-lg)',
                border: '1px solid var(--border)',
                padding: '1.75rem',
                boxShadow: 'var(--shadow-sm)'
              }}
            >
              <h2 style={{ fontSize: '1.25rem', fontWeight: 700, marginBottom: '1.25rem', color: 'var(--text-main)', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                <CreditCard size={20} style={{ color: 'var(--primary)' }} />
                2. Select Payment Method
              </h2>

              <div style={{ display: 'flex', flexDirection: 'column', gap: '0.85rem' }}>
                <label
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: '1rem',
                    padding: '1rem 1.25rem',
                    borderRadius: 'var(--radius-md)',
                    border: formData.payment_method === 'Cash on Delivery' ? '2px solid var(--primary)' : '1px solid var(--border)',
                    background: formData.payment_method === 'Cash on Delivery' ? 'var(--primary-light)' : 'white',
                    cursor: 'pointer'
                  }}
                >
                  <input
                    type="radio"
                    name="payment_method"
                    value="Cash on Delivery"
                    checked={formData.payment_method === 'Cash on Delivery'}
                    onChange={handleChange}
                  />
                  <Banknote size={22} style={{ color: 'var(--primary)' }} />
                  <div>
                    <div style={{ fontWeight: 700, color: 'var(--text-main)' }}>Cash on Delivery (COD)</div>
                    <div style={{ fontSize: '0.82rem', color: 'var(--text-muted)' }}>Pay with cash or UPI when your parcel is delivered</div>
                  </div>
                </label>

                <label
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: '1rem',
                    padding: '1rem 1.25rem',
                    borderRadius: 'var(--radius-md)',
                    border: formData.payment_method === 'Demo Online Payment' ? '2px solid var(--primary)' : '1px solid var(--border)',
                    background: formData.payment_method === 'Demo Online Payment' ? 'var(--primary-light)' : 'white',
                    cursor: 'pointer'
                  }}
                >
                  <input
                    type="radio"
                    name="payment_method"
                    value="Demo Online Payment"
                    checked={formData.payment_method === 'Demo Online Payment'}
                    onChange={handleChange}
                  />
                  <CreditCard size={22} style={{ color: '#8b5cf6' }} />
                  <div>
                    <div style={{ fontWeight: 700, color: 'var(--text-main)' }}>Demo Online Payment (Simulated)</div>
                    <div style={{ fontSize: '0.82rem', color: 'var(--text-muted)' }}>Demo simulation for testing without real card charges</div>
                  </div>
                </label>
              </div>
            </div>
          </div>

          {/* Review Order Summary Column */}
          <div
            style={{
              background: 'white',
              borderRadius: 'var(--radius-lg)',
              border: '1px solid var(--border)',
              padding: '1.75rem',
              boxShadow: 'var(--shadow-sm)',
              position: 'sticky',
              top: '90px'
            }}
          >
            <h3 style={{ fontSize: '1.25rem', fontWeight: 700, marginBottom: '1.25rem', color: 'var(--text-main)' }}>
              Items in Order ({cartCount})
            </h3>

            <div style={{ maxHeight: '240px', overflowY: 'auto', marginBottom: '1.25rem', paddingRight: '0.5rem' }}>
              {items.map((it) => (
                <div key={it.id} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '0.6rem 0', borderBottom: '1px solid var(--border)' }}>
                  <div>
                    <div style={{ fontSize: '0.92rem', fontWeight: 600, color: 'var(--text-main)' }}>{it.name}</div>
                    <div style={{ fontSize: '0.82rem', color: 'var(--text-muted)' }}>Qty: {it.quantity} × {formatPrice(it.price)}</div>
                  </div>
                  <div style={{ fontWeight: 700, color: 'var(--text-main)', fontSize: '0.95rem' }}>
                    {formatPrice(it.price * it.quantity)}
                  </div>
                </div>
              ))}
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem', paddingBottom: '1.25rem', borderBottom: '1px solid var(--border)' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.92rem', color: 'var(--text-muted)' }}>
                <span>Subtotal</span>
                <span style={{ fontWeight: 600, color: 'var(--text-main)' }}>{formatPrice(subtotal)}</span>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.92rem', color: 'var(--text-muted)' }}>
                <span>Delivery Fee</span>
                {shippingFee === 0 ? (
                  <span style={{ fontWeight: 700, color: 'var(--success)' }}>FREE</span>
                ) : (
                  <span style={{ fontWeight: 600, color: 'var(--text-main)' }}>{formatPrice(shippingFee)}</span>
                )}
              </div>
            </div>

            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline', margin: '1.25rem 0' }}>
              <span style={{ fontSize: '1.15rem', fontWeight: 700, color: 'var(--text-main)' }}>Order Total</span>
              <span style={{ fontSize: '1.6rem', fontWeight: 800, color: 'var(--primary)' }}>{formatPrice(total)}</span>
            </div>

            <button
              type="submit"
              className="btn btn-primary btn-block btn-lg"
              disabled={submitting}
            >
              {submitting ? 'Placing Order...' : 'Confirm & Place Order'}
            </button>

            <div style={{ marginTop: '1rem', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.5rem', color: 'var(--text-muted)', fontSize: '0.82rem' }}>
              <ShieldCheck size={16} />
              <span>Encrypted SSL & Instant Order Confirmation</span>
            </div>
          </div>
        </div>
      </form>
    </div>
  );
}
