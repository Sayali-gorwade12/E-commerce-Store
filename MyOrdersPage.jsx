import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Package, Calendar, Clock, CreditCard, ChevronDown, ChevronUp, ShoppingBag, ArrowRight } from 'lucide-react';
import { useCart } from '../context/CartContext';
import LoadingSpinner from '../components/LoadingSpinner';
import ErrorMessage from '../components/ErrorMessage';
import EmptyState from '../components/EmptyState';
import api from '../services/api';

export default function MyOrdersPage() {
  const { formatPrice } = useCart();
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [expandedOrders, setExpandedOrders] = useState({});

  useEffect(() => {
    async function fetchOrders() {
      try {
        setLoading(true);
        setError(null);
        const res = await api.get('/orders/my-orders');
        if (res.data?.success) {
          setOrders(res.data.data);
          // Expand first order by default
          if (res.data.data.length > 0) {
            setExpandedOrders({ [res.data.data[0].id]: true });
          }
        }
      } catch (err) {
        setError(err.response?.data?.message || 'Failed to load order history.');
      } finally {
        setLoading(false);
      }
    }

    fetchOrders();
  }, []);

  const toggleExpand = (orderId) => {
    setExpandedOrders(prev => ({
      ...prev,
      [orderId]: !prev[orderId]
    }));
  };

  const getStatusBadge = (status) => {
    switch (status) {
      case 'Delivered':
        return <span style={{ background: '#ecfdf5', color: '#065f46', padding: '4px 10px', borderRadius: 'var(--radius-full)', fontSize: '0.78rem', fontWeight: 700 }}>Delivered</span>;
      case 'Shipped':
        return <span style={{ background: '#eff6ff', color: '#1e40af', padding: '4px 10px', borderRadius: 'var(--radius-full)', fontSize: '0.78rem', fontWeight: 700 }}>Shipped</span>;
      case 'Cancelled':
        return <span style={{ background: '#fef2f2', color: '#991b1b', padding: '4px 10px', borderRadius: 'var(--radius-full)', fontSize: '0.78rem', fontWeight: 700 }}>Cancelled</span>;
      default:
        return <span style={{ background: '#fffbeb', color: '#92400e', padding: '4px 10px', borderRadius: 'var(--radius-full)', fontSize: '0.78rem', fontWeight: 700 }}>Placed</span>;
    }
  };

  if (loading) {
    return <LoadingSpinner message="Loading your order history..." />;
  }

  return (
    <div className="container" style={{ padding: '2rem 1.25rem', maxWidth: '850px' }}>
      <div style={{ marginBottom: '2rem' }}>
        <h1 style={{ fontSize: '2rem', fontWeight: 800, color: 'var(--text-main)', letterSpacing: '-0.02em' }}>
          My Order History
        </h1>
        <p style={{ color: 'var(--text-muted)', fontSize: '0.95rem' }}>
          Review and track all orders placed with your ShopSphere account
        </p>
      </div>

      {error && <ErrorMessage message={error} />}

      {orders.length === 0 ? (
        <EmptyState
          icon={Package}
          title="No orders placed yet"
          description="You haven't made any purchases yet. When you place an order, it will appear right here with live delivery status."
          actionText="Start Shopping"
          actionLink="/products"
        />
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
          {orders.map((order) => {
            const isExpanded = expandedOrders[order.id];
            const dateStr = new Date(order.created_at).toLocaleDateString('en-IN', {
              year: 'numeric',
              month: 'short',
              day: 'numeric'
            });

            return (
              <div
                key={order.id}
                style={{
                  background: 'white',
                  borderRadius: 'var(--radius-lg)',
                  border: '1px solid var(--border)',
                  overflow: 'hidden',
                  boxShadow: 'var(--shadow-sm)'
                }}
              >
                {/* Order Summary Header */}
                <div
                  style={{
                    padding: '1.25rem 1.5rem',
                    background: '#f8fafc',
                    borderBottom: '1px solid var(--border)',
                    display: 'flex',
                    flexWrap: 'wrap',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    gap: '1rem',
                    cursor: 'pointer'
                  }}
                  onClick={() => toggleExpand(order.id)}
                >
                  <div style={{ display: 'flex', alignItems: 'center', gap: '1.5rem', flexWrap: 'wrap' }}>
                    <div>
                      <div style={{ fontSize: '0.75rem', textTransform: 'uppercase', color: 'var(--text-muted)', fontWeight: 600 }}>
                        Order Reference
                      </div>
                      <div style={{ fontWeight: 700, fontFamily: 'monospace', color: 'var(--text-main)', fontSize: '0.95rem' }}>
                        {order.order_number}
                      </div>
                    </div>

                    <div>
                      <div style={{ fontSize: '0.75rem', textTransform: 'uppercase', color: 'var(--text-muted)', fontWeight: 600 }}>
                        Date Placed
                      </div>
                      <div style={{ fontWeight: 600, color: 'var(--text-main)', fontSize: '0.9rem' }}>
                        {dateStr}
                      </div>
                    </div>

                    <div>
                      <div style={{ fontSize: '0.75rem', textTransform: 'uppercase', color: 'var(--text-muted)', fontWeight: 600 }}>
                        Total Amount
                      </div>
                      <div style={{ fontWeight: 800, color: 'var(--primary)', fontSize: '1rem' }}>
                        {formatPrice(order.total_amount)}
                      </div>
                    </div>
                  </div>

                  <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
                    {getStatusBadge(order.order_status)}
                    <button type="button" style={{ color: 'var(--text-muted)' }}>
                      {isExpanded ? <ChevronUp size={20} /> : <ChevronDown size={20} />}
                    </button>
                  </div>
                </div>

                {/* Expanded Items & Address */}
                {isExpanded && (
                  <div style={{ padding: '1.5rem' }}>
                    <h4 style={{ fontSize: '0.95rem', fontWeight: 700, marginBottom: '0.75rem', color: 'var(--text-main)' }}>
                      Purchased Items ({order.items?.length || 0})
                    </h4>

                    <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem', marginBottom: '1.5rem' }}>
                      {order.items?.map((item) => (
                        <div
                          key={item.id}
                          style={{
                            display: 'flex',
                            justifyContent: 'space-between',
                            alignItems: 'center',
                            padding: '0.75rem 0',
                            borderBottom: '1px solid #f1f5f9'
                          }}
                        >
                          <div>
                            <div style={{ fontWeight: 600, color: 'var(--text-main)', fontSize: '0.95rem' }}>
                              {item.product_name}
                            </div>
                            <div style={{ fontSize: '0.82rem', color: 'var(--text-muted)' }}>
                              Quantity: {item.quantity} × {formatPrice(item.price)}
                            </div>
                          </div>
                          <div style={{ fontWeight: 700, color: 'var(--text-main)', fontSize: '0.95rem' }}>
                            {formatPrice(item.line_total)}
                          </div>
                        </div>
                      ))}
                    </div>

                    {/* Shipping Address and Payment Info */}
                    <div
                      style={{
                        display: 'grid',
                        gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))',
                        gap: '1.25rem',
                        background: '#f8fafc',
                        padding: '1.25rem',
                        borderRadius: 'var(--radius-md)',
                        fontSize: '0.88rem'
                      }}
                    >
                      <div>
                        <div style={{ fontWeight: 700, color: 'var(--text-main)', marginBottom: '0.35rem' }}>
                          Delivery Address
                        </div>
                        <div style={{ color: 'var(--text-muted)', lineHeight: '1.5' }}>
                          {order.customer_name}<br />
                          {order.shipping_address}<br />
                          {order.city}, {order.state} - {order.postal_code}<br />
                          Phone: {order.phone}
                        </div>
                      </div>

                      <div>
                        <div style={{ fontWeight: 700, color: 'var(--text-main)', marginBottom: '0.35rem' }}>
                          Payment Information
                        </div>
                        <div style={{ color: 'var(--text-muted)', lineHeight: '1.5' }}>
                          Method: <strong>{order.payment_method}</strong><br />
                          Status: <strong>{order.payment_status}</strong><br />
                          Subtotal: {formatPrice(order.subtotal)}<br />
                          Delivery Fee: {order.shipping_fee === 0 ? 'FREE' : formatPrice(order.shipping_fee)}
                        </div>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
