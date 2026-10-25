import React, { useState, useEffect } from 'react';
import { useSearchParams } from 'react-router-dom';
import ProductGrid from '../components/ProductGrid';
import SearchBar from '../components/SearchBar';
import CategoryFilter from '../components/CategoryFilter';
import SortDropdown from '../components/SortDropdown';
import ErrorMessage from '../components/ErrorMessage';
import api from '../services/api';
import { ChevronLeft, ChevronRight, SlidersHorizontal } from 'lucide-react';

export default function ProductsPage() {
  const [searchParams, setSearchParams] = useSearchParams();

  const currentCategory = searchParams.get('category') || '';
  const currentSearch = searchParams.get('search') || '';
  const currentSort = searchParams.get('sort') || 'newest';
  const currentPage = parseInt(searchParams.get('page') || '1', 10);

  const [products, setProducts] = useState([]);
  const [categories, setCategories] = useState([]);
  const [pagination, setPagination] = useState({ total: 0, page: 1, limit: 12, totalPages: 1 });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Load categories once
  useEffect(() => {
    async function fetchCategories() {
      try {
        const res = await api.get('/categories');
        if (res.data?.success) {
          setCategories(res.data.data);
        }
      } catch (err) {
        console.error('Failed to load categories:', err);
      }
    }
    fetchCategories();
  }, []);

  // Fetch products whenever searchParams change
  useEffect(() => {
    async function fetchProducts() {
      try {
        setLoading(true);
        setError(null);

        const params = new URLSearchParams();
        if (currentSearch) params.set('search', currentSearch);
        if (currentCategory) params.set('category', currentCategory);
        if (currentSort) params.set('sort', currentSort);
        params.set('page', currentPage.toString());
        params.set('limit', '12');

        const res = await api.get(`/products?${params.toString()}`);
        if (res.data?.success) {
          setProducts(res.data.data);
          setPagination(res.data.pagination);
        }
      } catch (err) {
        setError(err.response?.data?.message || 'Error loading products from server.');
      } finally {
        setLoading(false);
      }
    }

    fetchProducts();
  }, [currentCategory, currentSearch, currentSort, currentPage]);

  const updateParam = (key, value) => {
    const nextParams = new URLSearchParams(searchParams);
    if (value) {
      nextParams.set(key, value);
    } else {
      nextParams.delete(key);
    }
    if (key !== 'page') {
      nextParams.set('page', '1');
    }
    setSearchParams(nextParams);
  };

  const handleClearFilters = () => {
    setSearchParams({});
  };

  return (
    <div className="container" style={{ padding: '2rem 1.25rem' }}>
      {/* Header */}
      <div style={{ marginBottom: '1.5rem' }}>
        <h1 style={{ fontSize: '2rem', fontWeight: 800, color: 'var(--text-main)', letterSpacing: '-0.02em' }}>
          Explore Products
        </h1>
        <p style={{ color: 'var(--text-muted)', fontSize: '0.95rem' }}>
          Discover our curated collection with real-time stock availability.
        </p>
      </div>

      {/* Filter and Search Bar */}
      <div className="filter-bar">
        <SearchBar
          value={currentSearch}
          onChange={(val) => updateParam('search', val)}
          placeholder="Search by title or description..."
        />

        <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', flexWrap: 'wrap' }}>
          <SortDropdown
            value={currentSort}
            onChange={(val) => updateParam('sort', val)}
          />
        </div>
      </div>

      {/* Category Pills Bar */}
      <div style={{ marginBottom: '1.75rem', display: 'flex', alignItems: 'center', gap: '0.75rem', flexWrap: 'wrap' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', color: 'var(--text-muted)', fontSize: '0.88rem', fontWeight: 600 }}>
          <SlidersHorizontal size={16} />
          <span>Category:</span>
        </div>
        <CategoryFilter
          categories={categories}
          selectedCategory={currentCategory}
          onSelectCategory={(cat) => updateParam('category', cat)}
        />
        {(currentSearch || currentCategory) && (
          <button
            type="button"
            onClick={handleClearFilters}
            className="btn btn-sm btn-secondary"
            style={{ fontSize: '0.8rem', padding: '0.3rem 0.65rem' }}
          >
            Clear Filters
          </button>
        )}
      </div>

      {/* Result Count */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem' }}>
        <span style={{ fontSize: '0.9rem', color: 'var(--text-muted)' }}>
          Showing <strong>{products.length}</strong> of <strong>{pagination.total}</strong> products
          {currentCategory && ` in ${currentCategory}`}
        </span>
      </div>

      {error && <ErrorMessage message={error} onRetry={() => updateParam('page', currentPage.toString())} />}

      {/* Products Grid */}
      <ProductGrid
        products={products}
        loading={loading}
        emptyMessage={
          currentSearch || currentCategory
            ? `No products found for "${currentSearch || currentCategory}". Try different search terms or click "Clear Filters".`
            : 'No products are currently available in the catalog.'
        }
      />

      {/* Pagination Controls */}
      {pagination.totalPages > 1 && (
        <div
          style={{
            display: 'flex',
            justifyContent: 'center',
            alignItems: 'center',
            gap: '1rem',
            margin: '3rem 0 1rem 0'
          }}
        >
          <button
            type="button"
            className="btn btn-secondary btn-sm"
            onClick={() => updateParam('page', (currentPage - 1).toString())}
            disabled={currentPage <= 1 || loading}
          >
            <ChevronLeft size={16} />
            Previous
          </button>

          <span style={{ fontSize: '0.9rem', fontWeight: 600, color: 'var(--text-main)' }}>
            Page {pagination.page} of {pagination.totalPages}
          </span>

          <button
            type="button"
            className="btn btn-secondary btn-sm"
            onClick={() => updateParam('page', (currentPage + 1).toString())}
            disabled={currentPage >= pagination.totalPages || loading}
          >
            Next
            <ChevronRight size={16} />
          </button>
        </div>
      )}
    </div>
  );
}
