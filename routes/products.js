// routes/products.js

const express = require('express');
const router = express.Router();
const pool = require('../db'); // Asegúrate de importar la conexión a la base de datos o métodos para acceder a los datos de productos

// Ruta para obtener todos los productos
router.get('/', async (req, res) => {
  try {
    const [rows] = await pool.query('SELECT * FROM products'); 
    res.json(rows);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

module.exports = router;
