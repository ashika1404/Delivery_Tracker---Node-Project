const express = require('express');
const router = express.Router();
const { MongoClient } = require("mongodb");
const { getClient } = require('../db');
const authSchema = require('../model/authSchema');
const jwt = require('jsonwebtoken');
const bcrypt = require('bcrypt');
const config = require('config')
const blacklist = [];
async function registerUser(req, res, userType, client) {
    try {
        const { email, password, username } = req.body;
        const { error } = authSchema.validate(req.body);
        if (error) {
            return res.status(400).json({ error: error.details[0].message });
        }
        const saltRounds = 10;
        const hashedPassword = await bcrypt.hash(password, saltRounds);
        const usersCollection = client.collection('Users');
        const existingUser = await usersCollection.findOne({ email });
        if (existingUser) {
            return res.status(400).json({ error: 'User already registered' });
        } else {
            const newUser = {
                username: username,
                email: email,
                userType: userType,
                password: hashedPassword,
            };
            await usersCollection.insertOne(newUser);
            res.status(201).json({ message: 'Registered successfully' });
        }
    } catch (error) {
        console.error('Error registering user:', error);
        res.status(500).json({ error: 'Internal Server Error' });
    }
}


router.post('/register', async (req, res) => {
    const client = getClient()
    return registerUser(req, res, 'basic user', client);
});

router.post('/admin/register', async (req, res) => {
    const client = getClient()
    return registerUser(req, res, 'admin', client);
});


router.post('/login', async (req, res) => {
    try {
        const { email, password, username, userType } = req.body;
        const client = getClient()
        const usersCollection = client.collection('Users');
        const user = await usersCollection.findOne({ email, userType, username });
        console.log(user)
        if (!user) {
            return res.status(401).json({ error: 'Invalid username or password' });
        }
        const passwordMatch = await bcrypt.compare(password, user.password);
        if (passwordMatch) {
            const token = jwt.sign({ userType: user.userType, userId: user._id }, config.JwtKey);
            return res.status(200).json({ message: 'Logged in Successfully', token });
        } else {
            return res.status(401).json({ error: 'Invalid username or password' });
        }
    } catch (error) {
        console.error('Error logging in:', error);
        res.status(500).json({ error: 'Internal Server Error' });
    }
});

router.post('/logout', (req, res) => {
    try {
        const token = req.headers["x-auth-token"];
        if (!token) {
            return res.status(401).json({ error: 'Token not provided' });
        }
        blacklist.push(token);
        return res.status(200).json({ message: 'Logged out successfully' });
    } catch (error) {
        console.error('Error logging out:', error);
        res.status(500).json({ error: 'Internal Server Error' });
    }
});

module.exports = {
    router: router,
    blacklist: blacklist
};