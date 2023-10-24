const express = require('express');
const { MongoClient } = require("mongodb");
const router = express.Router();
const { getClient } = require('../db');
const { ObjectId } = require('mongodb');
const userSchema = require('../model/userSchema');
const verifyToken = require('../verify_token');
const checkPermissions = require('../checkPermission');
const jwt = require('jsonwebtoken');
const bcrypt = require('bcrypt');
const config = require('config');
const allowedUserType = require('../allowedUserType')
const setPassword = require('../model/setPassword');
router.post('/', verifyToken, allowedUserType, async (req, res) => {
    try {
        const { email, username, userType } = req.body;
        const { error } = userSchema.validate(req.body);
        if (error) {
            return res.status(400).json({ error: error.details[0].message });
        }
        const client = getClient()
        const usersCollection = client.collection('Users');
        const existingUser = await usersCollection.findOne({ email });
        if (existingUser) {
            return res.status(400).json({ error: 'User already registered' });
        } else {
            const newUser = { username, email, userType };
            await usersCollection.insertOne(newUser);
            res.status(201).json({ message: 'User Added successfully' });
        }
    } catch (error) {
        console.error('Error Creating user:', error);
        res.status(500).json({ error: 'Internal Server Error' });
    }
});
router.post('/set-password/:userId', async (req, res) => {
    try {
        const userId = req.params.userId;
        console.log(userId)
        if (!ObjectId.isValid(userId)) {
            return res.status(400).json({ error: 'Invalid userId' });
        }
        const { error } = setPassword.validate(req.body);
        if (error) {
            return res.status(400).json({ error: error.details[0].message });
        }
        const client = getClient()
        const usersCollection = client.collection('Users');
        const saltRounds = 10;
        const hashedPassword = await bcrypt.hash(req.body.password, saltRounds);
        console.log(hashedPassword)
        const createduser = await usersCollection.findOne({ _id: new ObjectId(userId) });
        console.log(createduser)
        if (!createduser) {
            return res.status(404).json({ error: 'User not found' });
        }
        const filter = { _id: new ObjectId(userId) };
        console.log(filter)
        const update = { $set: { password: hashedPassword } };
        console.log(update)
        const result = await usersCollection.updateOne(filter, update);
        console.log(result)
        res.status(200).json({ message: 'Password has been set successfully' })

    } catch (error) {

        res.status(500).json({ error: 'Error setting password' });
    }
});
router.get('/get_users_details', verifyToken, async (req, res) => {
    try {
        const client = getClient()
        const usersCollection = client.collection('Users');
        const projection = {
            username: 1,
            email: 1,
            userType: 1,
            _id: 0

        };
        const usersList = await usersCollection.find({}, { projection }).toArray();
        res.status(201).json(usersList);
    }
    catch (error) {
        res.status(500).send(error);
    }
});

router.put('/:userId', verifyToken, allowedUserType, async (req, res) => {
    try {
        const userId = req.params.userId;
        if (!ObjectId.isValid(userId)) {
            return res.status(400).json({ error: 'Invalid userId' });
        }
        const { email, username, userType } = req.body;
        const { error } = userSchema.validate(req.body);
        if (error) {
            return res.status(400).json({ error: error.details[0].message });
        }
        const client = getClient()
        const usersCollection = client.collection('Users');
        const existingUser = await usersCollection.findOne({ _id: new ObjectId(userId) });
        if (existingUser) {
            const filter = { _id: new ObjectId(userId) };
            const update = { $set: req.body };
            const result = await usersCollection.updateOne(filter, update);
            res.status(200).json({ message: 'User details updated successfully', updatedBy: req.id })
        }
        else {
            res.status(404).json({ error: 'User not found' });
        }

    } catch (error) {
        console.error('Error updating user details:', error);
        res.status(500).json({ error: 'Error updating user details' });
    }
});


router.delete('/:userId', verifyToken, allowedUserType, async (req, res) => {
    try {
        const userId = req.params.userId;
        if (!ObjectId.isValid(userId)) {
            return res.status(400).json({ error: 'Invalid userId' });
        }
        const client = getClient()
        const usersCollection = client.collection('Users');
        const existingUser = await usersCollection.findOne({ _id: new ObjectId(userId) });
        if (existingUser) {
            await usersCollection.deleteOne({ _id: new ObjectId(userId) });
            res.status(200).json({ message: 'User deleted successfully' });
        }
        else {
            res.status(404).json({ error: 'User not found' });
        }
    } catch (error) {
        console.error('Error deleting user:', error);
        res.status(500).json({ error: 'Error deleting user' });
    }
})

module.exports = router;

