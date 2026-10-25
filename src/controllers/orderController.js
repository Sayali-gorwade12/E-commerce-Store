const { getDatabase } = require('../database/db');
const { toPaise, toRupees, calculateShipping } = require('../utils/money');

exports.createOrder = (req, res, next) => {
  try {
    const userId = req.user.id;
    const {
      customer_name,
      phone,
      shipping_address,
      city,
      state,
      postal_code,
      payment_method = 'Cash on Delivery',
      items
    } = req.body;

    // Required fields validation
    if (!customer_name || !customer_name.trim()) {
      return res.status(400).json({ success: false, message: 'Recipient name is required.' });
    }
    if (!phone || !phone.trim()) {
      return res.status(400).json({ success: false, message: 'Contact phone number is required.' });
    }
    if (!shipping_address || !shipping_address.trim()) {
      return res.status(400).json({ success: false, message: 'Shipping address is required.' });
    }
    if (!city || !city.trim()) {
      return res.status(400).json({ success: false, message: 'City is required.' });
    }
    if (!state || !state.trim()) {
      return res.status(400).json({ success: false, message: 'State is required.' });
    }
    if (!postal_code || !postal_code.trim()) {
      return res.status(400).json({ success: false, message: 'Postal/PIN code is required.' });
    }

    if (!Array.isArray(items) || items.length === 0) {
      return res.status(400).json({
        success: false,
        message: 'Order must contain at least one item.'
      });
    }

    const db = getDatabase();

    // Validate items and recalculate prices strictly on server
    const validatedItems = [];
    let subtotalPaise = 0;

    for (const item of items) {
      const productId = parseInt(item.product_id, 10);
      const quantity = parseInt(item.quantity, 10);

      if (isNaN(productId) || productId <= 0) {
        return res.status(400).json({
          success: false,
          message: 'Invalid product ID in order items.'
        });
      }

      if (isNaN(quantity) || quantity <= 0) {
        return res.status(400).json({
          success: false,
          message: 'Quantity must be a positive number.'
        });
      }

      const product = db.prepare('SELECT id, name, price, stock FROM products WHERE id = ?').get(productId);

      if (!product) {
        return res.status(400).json({
          success: false,
          message: `Product with ID ${productId} does not exist.`
        });
      }

      if (product.stock < quantity) {
        return res.status(400).json({
          success: false,
          message: `Insufficient stock for "${product.name}". Available stock: ${product.stock}, requested: ${quantity}.`
        });
      }

      const unitPricePaise = toPaise(product.price);
      const lineTotalPaise = unitPricePaise * quantity;
      subtotalPaise += lineTotalPaise;

      validatedItems.push({
        product_id: product.id,
        product_name: product.name,
        price: product.price,
        quantity,
        line_total: toRupees(lineTotalPaise)
      });
    }

    const subtotal = toRupees(subtotalPaise);
    const shippingFee = calculateShipping(subtotal);
    const totalAmount = toRupees(subtotalPaise + toPaise(shippingFee));

    const orderNumber = `ORD-${Date.now()}-${Math.floor(1000 + Math.random() * 9000)}`;

    // Atomic transaction for order, items, and stock decrement
    const executeOrderTransaction = db.transaction(() => {
      // 1. Insert order
      const orderInsert = db.prepare(`
        INSERT INTO orders (
          order_number, user_id, customer_name, phone,
          shipping_address, city, state, postal_code,
          subtotal, shipping_fee, total_amount,
          payment_method, payment_status, order_status
        ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
      `).run(
        orderNumber,
        userId,
        customer_name.trim(),
        phone.trim(),
        shipping_address.trim(),
        city.trim(),
        state.trim(),
        postal_code.trim(),
        subtotal,
        shippingFee,
        totalAmount,
        payment_method,
        payment_method === 'Demo Online Payment' ? 'Paid (Demo)' : 'Pending',
        'Placed'
      );

      const orderId = Number(orderInsert.lastInsertRowid);

      // 2. Insert items and decrement stock
      const itemInsert = db.prepare(`
        INSERT INTO order_items (order_id, product_id, product_name, price, quantity, line_total)
        VALUES (?, ?, ?, ?, ?, ?)
      `);

      const stockUpdate = db.prepare(`
        UPDATE products
        SET stock = stock - ?
        WHERE id = ? AND stock >= ?
      `);

      for (const it of validatedItems) {
        itemInsert.run(orderId, it.product_id, it.product_name, it.price, it.quantity, it.line_total);

        const updateResult = stockUpdate.run(it.quantity, it.product_id, it.quantity);
        if (updateResult.changes === 0) {
          throw new Error(`Stock concurrency conflict: Insufficient stock for ${it.product_name}`);
        }
      }

      return orderId;
    });

    const newOrderId = executeOrderTransaction();

    return res.status(201).json({
      success: true,
      message: 'Order placed successfully!',
      data: {
        id: newOrderId,
        order_number: orderNumber,
        customer_name: customer_name.trim(),
        subtotal,
        shipping_fee: shippingFee,
        total_amount: totalAmount,
        payment_method,
        order_status: 'Placed',
        items: validatedItems
      }
    });
  } catch (error) {
    next(error);
  }
};

exports.getMyOrders = (req, res, next) => {
  try {
    const userId = req.user.id;
    const db = getDatabase();

    const orders = db.prepare(`
      SELECT * FROM orders
      WHERE user_id = ?
      ORDER BY id DESC
    `).all(userId);

    const getItems = db.prepare(`
      SELECT * FROM order_items
      WHERE order_id = ?
    `);

    const fullOrders = orders.map(ord => ({
      ...ord,
      items: getItems.all(ord.id)
    }));

    return res.status(200).json({
      success: true,
      message: 'Orders retrieved successfully.',
      data: fullOrders
    });
  } catch (error) {
    next(error);
  }
};

exports.getOrderById = (req, res, next) => {
  try {
    const userId = req.user.id;
    const identifier = req.params.id;
    const db = getDatabase();

    let order;
    const numId = parseInt(identifier, 10);

    if (!isNaN(numId) && String(numId) === String(identifier)) {
      order = db.prepare('SELECT * FROM orders WHERE id = ?').get(numId);
    } else {
      order = db.prepare('SELECT * FROM orders WHERE order_number = ?').get(identifier);
    }

    if (!order) {
      return res.status(404).json({
        success: false,
        message: 'Order not found.'
      });
    }

    // Security check: only the owner can view this order
    if (order.user_id !== userId) {
      return res.status(403).json({
        success: false,
        message: 'Access forbidden. You do not have permission to view this order.'
      });
    }

    const items = db.prepare('SELECT * FROM order_items WHERE order_id = ?').all(order.id);

    return res.status(200).json({
      success: true,
      message: 'Order details retrieved successfully.',
      data: {
        ...order,
        items
      }
    });
  } catch (error) {
    next(error);
  }
};
