import React from 'react';
import ProductCard from './ProductCard';
import LoadingSpinner from './LoadingSpinner';
import EmptyState from './EmptyState';

export default function ProductGrid({ products, loading, emptyMessage }) {
  if (loading) {
    return <LoadingSpinner message="Fetching products from ShopSphere..." />;
  }

  if (!products || products.length === 0) {
    return (
      <EmptyState
        title="No products match your criteria"
        description={emptyMessage || "We couldn't find any items matching your search or selected filter. Try clearing filters or searching for something else."}
        actionText="View All Products"
        actionLink="/products"
      />
    );
  }

  return (
    <div className="product-grid">
      {products.map((product) => (
        <ProductCard key={product.id} product={product} />
      ))}
    </div>
  );
}
