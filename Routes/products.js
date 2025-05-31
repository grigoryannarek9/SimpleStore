const express = require('express');
const fs = require('fs');
const path = require('path');

const authenticateJWT = require('../Middleware/authenticateJWT');
const authorizeRole = require('../Middleware/authorizeRole');

const router = express.Router();

const PRODUCTS_FILE = path.join(__dirname, '../Data/products.json');

function readProducts() {
    const data = fs.readFileSync(PRODUCTS_FILE, 'utf-8');
    return JSON.parse(data);
}

function writeProducts(data) {
    fs.writeFileSync(PRODUCTS_FILE, JSON.stringify(data, null, 2));
}

router.get('/', authenticateJWT, (req, res) => {
    const products = readProducts();
    res.json(products);
});

router.post('/', authenticateJWT, authorizeRole('admin'), (req, res) => {
    const products = readProducts();
    const newProduct = { ...req.body, id: Date.now(), available: true };
    products.push(newProduct);
    writeProducts(products);
    res.status(201).json({ message: 'Product added', product: newProduct });
});

router.delete('/:id', authenticateJWT, authorizeRole('admin'), (req, res) => {
    let products = readProducts();
    const productId = parseInt(req.params.id);
    products = products.filter(p => p.id !== productId);
    writeProducts(products);
    res.json({ message: 'Product deleted' });
});

module.exports = router;
