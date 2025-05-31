require('dotenv').config(); 

const express = require('express');
const app = express();

app.use(express.json());

const authRoutes = require('./Routes/auth');
const productRoutes = require('./Routes/products');
const userRoutes = require('./Routes/users');

app.use('/auth', authRoutes);
app.use('/products', productRoutes);

const PORT = process.env.PORT || 8080;

app.listen(PORT, () => {
    console.log(`The Server is Listening under the PORT ${PORT}`);
});
