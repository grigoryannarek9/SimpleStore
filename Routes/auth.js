const express = require('express');
const router = express.Router();
const fs = require('fs');
const path = require('path');
const jwt = require('jsonwebtoken');
const bcrypt = require('bcrypt');
const { body, validationResult } = require('express-validator');
require('dotenv').config();

const USER_FILE = path.join(__dirname, '../data/users.json');
const SECRET_KEY = process.env.SECRET_KEY;

function WriteSync(filePath, data) {
    fs.writeFileSync(filePath, JSON.stringify(data, null, 2));
}

function ReadSync(filePath) {
    const data = fs.readFileSync(filePath, 'utf-8');
    return JSON.parse(data);
}

router.post('/register',
[
    body('name').notEmpty().withMessage('Name is required'),
    body('age').notEmpty().withMessage('Age is required'),
    body('email').isEmail().withMessage('Invalid email format'),
    body('password').isLength({ min: 8 }).withMessage('Password must be at least 8 characters long')
],
async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
        return res.status(400).json({ errors: errors.array() });
    }

    const { name, age, email, password } = req.body;
    const USERS_READ = ReadSync(USER_FILE);

    if (USERS_READ.find(user => user.email === email)) {
        return res.status(400).send("This email is already in use.");
    }

    const hashedPassword = await bcrypt.hash(password, 15);
    const NEW_REGISTERED_USER = {
        name: name,
        age: age,
        email: email,
        password: hashedPassword,
        role: 'user'
    };

    USERS_READ.push(NEW_REGISTERED_USER);
    WriteSync(USER_FILE, USERS_READ);

    res.status(201).send("Registration successful.");
});

router.post('/login', async (req, res) => {
    const { email, password } = req.body;
    const USERS = ReadSync(USER_FILE);
    const CHECK_USER = USERS.find(user => user.email === email);

    if (!CHECK_USER) {
        return res.status(400).send("The email was not found in our data.");
    }

    const isMatch = await bcrypt.compare(password, CHECK_USER.password);
    if (!isMatch) {
        return res.status(400).send("Incorrect password.");
    }

    const token = jwt.sign(
        { name: CHECK_USER.name, email: CHECK_USER.email, role: CHECK_USER.role },
        SECRET_KEY,
        { expiresIn: '1h' }
    );

    res.status(200).json({ message: "Correct verification", token });
});

module.exports = router;
