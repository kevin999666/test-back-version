const express = require('express');
const router = express.Router();
const pool = require('../db');

// Get all orders
router.get('/', async (req, res) => {
  try {
    const [rows] = await pool.query('SELECT id, orderNumber AS order_number, date, products, finalPrice AS final_price FROM orders');
    res.json(rows);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Get a single order by ID
router.get('/:id', async (req, res) => {
  const { id } = req.params;
  try {
    const [[order]] = await pool.query('SELECT id, order_number AS orderNumber, date, final_price AS finalPrice FROM orders WHERE id = ?', [id]);
    if (!order) {
      return res.status(404).json({ error: 'Order not found' });
    }

    const [products] = await pool.query('SELECT product_id AS id, quantity FROM order_products WHERE order_id = ?', [id]);
    res.json({ ...order, products });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Create a new order
router.post('/', async (req, res) => {
  const { orderNumber, date, finalPrice, products } = req.body;
  try {
    const [result] = await pool.query('INSERT INTO orders (order_number, date, final_price) VALUES (?, ?, ?)', [orderNumber, date, finalPrice]);
    const orderId = result.insertId;

    const productQueries = products.map(product => (
      pool.query('INSERT INTO order_products (order_id, product_id, quantity) VALUES (?, ?, ?)', [orderId, product.id, product.quantity])
    ));
    await Promise.all(productQueries);

    res.status(201).json({ id: orderId, orderNumber, date, finalPrice, products });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Update an existing order
router.put('/:id', async (req, res) => {
  const { id } = req.params;
  const { orderNumber, date, finalPrice, products } = req.body;
  try {
    const [result] = await pool.query('UPDATE orders SET order_number = ?, date = ?, final_price = ? WHERE id = ?', [orderNumber, date, finalPrice, id]);
    if (result.affectedRows === 0) {
      return res.status(404).json({ error: 'Order not found' });
    }

    // Delete existing products and insert updated ones
    await pool.query('DELETE FROM order_products WHERE order_id = ?', [id]);
    const productQueries = products.map(product => (
      pool.query('INSERT INTO order_products (order_id, product_id, quantity) VALUES (?, ?, ?)', [id, product.id, product.quantity])
    ));
    await Promise.all(productQueries);

    res.json({ id, orderNumber, date, finalPrice, products });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Delete an order
router.delete('/:id', async (req, res) => {
  const { id } = req.params;
  try {
    await pool.query('DELETE FROM order_products WHERE order_id = ?', [id]);
    const [result] = await pool.query('DELETE FROM orders WHERE id = ?', [id]);
    if (result.affectedRows === 0) {
      return res.status(404).json({ error: 'Order not found' });
    }
    res.json({ message: 'Order deleted' });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

module.exports = router;
