const { getDatabase } = require('../database/db');

exports.getProducts = (req, res, next) => {
  try {
    const db = getDatabase();
    const { search, category, sort, page = 1, limit = 12 } = req.query;

    const pageNum = Math.max(1, parseInt(page, 10) || 1);
    const limitNum = Math.min(50, Math.max(1, parseInt(limit, 10) || 12));
    const offset = (pageNum - 1) * limitNum;

    let baseQuery = 'FROM products WHERE 1=1';
    const params = [];

    if (search && search.trim()) {
      baseQuery += ' AND (name LIKE ? OR description LIKE ?)';
      const term = `%${search.trim()}%`;
      params.push(term, term);
    }

    if (category && category.trim()) {
      baseQuery += ' AND category = ?';
      params.push(category.trim());
    }

    // Count total matching
    const countSql = `SELECT COUNT(*) as count ${baseQuery}`;
    const totalRow = db.prepare(countSql).get(...params);
    const total = totalRow ? totalRow.count : 0;

    // Sorting
    let orderBy = 'ORDER BY id DESC';
    if (sort === 'price_asc') {
      orderBy = 'ORDER BY price ASC';
    } else if (sort === 'price_desc') {
      orderBy = 'ORDER BY price DESC';
    } else if (sort === 'name_asc') {
      orderBy = 'ORDER BY name ASC';
    } else if (sort === 'newest') {
      orderBy = 'ORDER BY created_at DESC';
    }

    const dataSql = `SELECT * ${baseQuery} ${orderBy} LIMIT ? OFFSET ?`;
    const products = db.prepare(dataSql).all(...params, limitNum, offset);

    return res.status(200).json({
      success: true,
      message: 'Products fetched successfully',
      data: products,
      pagination: {
        total,
        page: pageNum,
        limit: limitNum,
        totalPages: Math.ceil(total / limitNum) || 1
      }
    });
  } catch (error) {
    next(error);
  }
};

exports.getProductById = (req, res, next) => {
  try {
    const { id } = req.params;
    const numId = parseInt(id, 10);

    if (isNaN(numId) || numId <= 0) {
      return res.status(400).json({
        success: false,
        message: 'Invalid product ID.'
      });
    }

    const db = getDatabase();
    const product = db.prepare('SELECT * FROM products WHERE id = ?').get(numId);

    if (!product) {
      return res.status(404).json({
        success: false,
        message: 'Product not found.'
      });
    }

    return res.status(200).json({
      success: true,
      message: 'Product retrieved successfully.',
      data: product
    });
  } catch (error) {
    next(error);
  }
};

exports.getCategories = (req, res, next) => {
  try {
    const db = getDatabase();
    const categories = db.prepare(`
      SELECT category, COUNT(*) as count
      FROM products
      GROUP BY category
      ORDER BY category ASC
    `).all();

    return res.status(200).json({
      success: true,
      message: 'Categories fetched successfully.',
      data: categories
    });
  } catch (error) {
    next(error);
  }
};
