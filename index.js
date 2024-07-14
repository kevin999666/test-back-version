// app.js o index.js

const express = require('express');
const cors = require('cors');
const app = express();
const port = process.env.PORT || 3000;
const ordersRouter = require('./routes/orders');
const productsRouter = require('./routes/products');

app.use(cors());
app.use(express.json());
app.use('/orders', ordersRouter);
app.use('/products', productsRouter);

app.listen(port, () => {
  console.log(`Server is running on http://localhost:${port}`);
});
