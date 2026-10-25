import React from 'react';

export default function CategoryFilter({ categories, selectedCategory, onSelectCategory }) {
  const allCategories = ['All', ...categories.map(c => typeof c === 'string' ? c : c.category)];

  return (
    <div className="category-pills">
      {allCategories.map((cat) => {
        const isActive = (cat === 'All' && !selectedCategory) || selectedCategory === cat;
        return (
          <button
            key={cat}
            type="button"
            className={`pill-btn ${isActive ? 'active' : ''}`}
            onClick={() => onSelectCategory(cat === 'All' ? '' : cat)}
          >
            {cat}
          </button>
        );
      })}
    </div>
  );
}
