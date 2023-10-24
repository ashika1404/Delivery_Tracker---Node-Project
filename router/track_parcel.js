const express = require('express');
const router = express.Router();
const { getClient } = require('../db');
const { ObjectId } = require('mongodb');
const trackSchema = require('../model/trackSchema');
const updateSchema = require('../model/updateSchema');
const verifyToken = require('../verify_token');
const checkPermissions = require('../checkPermission');
const updateOrderStatusAndOTP = require('../updateOrderStatusAndOTP')
router.post('/create-order', verifyToken, checkPermissions(['basic user']), async (req, res) => {
    try {
        const { error } = trackSchema.validate(req.body);
        if (error) {
            res.status(400).json({ error: error.details[0].message });
        }
        const trackingID = Math.floor(100000000000 + Math.random() * 900000000000);
        const client = getClient()
        const ordersCollection = client.collection('Parcel');
        const parcel_details = { ...req.body, trackingID: trackingID, status: "Ordered" };
        const result = await ordersCollection.insertOne(parcel_details);

        res.status(201).json({ trackingID: trackingID, status: "Ordered" });;
    } catch (error) {
        console.error('Error adding parcel:', error);
        res.status(500).json({ error: 'Internal Server Error' });
    }

})

router.post('/generate-otp/:trackingID', verifyToken, checkPermissions(['basic user']), async (req, res) => {
    try {
        const trackingID = parseInt(req.params.trackingID);
        console.log('Received Tracking ID:', trackingID);
        const client = getClient()
        const ordersCollection = client.collection('Parcel');
        const existingOrder = await ordersCollection.findOne({ trackingID: trackingID })
        console.log('Existing Order:', existingOrder);
        if (existingOrder) {
            const otp = Math.floor(Math.random() * 900000) + 100000;
            const client = getClient()
            const otpCollection = client.collection('OTP');
            const otp_details = { trackingID: trackingID, OTP: otp };
            await otpCollection.insertOne(otp_details);
            res.status(201).json({ OTP: otp })
        }
        else {
            res.status(404).json({ error: 'Tracking ID not found' });
        }
    }
    catch (error) {
        res.status(500).json({ error: 'Internal Server Error' });
    }
})

router.put('/update-order/:trackingID', verifyToken, checkPermissions(['admin', 'manager', 'delivery boy']), async (req, res) => {
    try {
        const trackingID = parseInt(req.params.trackingID);
        const client = getClient()
        const ordersCollection = client.collection('Parcel');
        const existingOrder = await ordersCollection.findOne({ trackingID: trackingID })
        if (existingOrder) {
            const { status, otp } = req.body;
            console.log(otp)
            const { error } = updateSchema.validate({ status, otp });

            if (error) {
                return res.status(400).json({ error: error.details[0].message });
            }
            if (otp) {
                const client = getClient()
                const otpCollection = client.collection('OTP');
                const storedOTPDetails = await otpCollection.findOne({ trackingID: trackingID });
                const storedOTP = storedOTPDetails.OTP;
                console.log(storedOTP)
                if (otp === storedOTP) {
                    await updateOrderStatusAndOTP(ordersCollection, trackingID, status, otp);
                    res.status(200).json({ message: 'OTP verified successfully & Parcel is delivered', updatedBy: req.id });
                } else {
                    res.status(401).json({ error: 'Invalid OTP' });
                }
            }
            else {
                await updateOrderStatusAndOTP(ordersCollection, trackingID, status, otp);
                res.status(200).json({ message: 'Order details updated successfully', updatedBy: req.id })

            }

        }
        else {
            res.status(404).json({ error: 'Tracking ID not found' });
        }

    } catch (error) {
        res.status(500).json({ error: 'Error updating order details' });
    }
});
router.get('/track-details/:trackingID', async (req, res) => {
    const trackingID = parseInt(req.params.trackingID);
    console.log(trackingID)
    const client = getClient()
    const ordersCollection = client.collection('Parcel');
    const Order = await ordersCollection.findOne({ trackingID })
    if (Order) {
        res.status(200).json({ Order })
    }
    else {
        res.status(404).json({ error: 'Tracking ID not found' });
    }
});

router.get('/search-parcel', verifyToken, async (req, res) => {
    try {
        const { name, city } = req.query;
        if (!name && !city) {
            return res.status(400).json({ error: 'User or city parameter is required' });
        }
        const client = getClient()
        const ordersCollection = client.collection('Parcel');
        let query = {};
        if (name) {
            query = {
                $or: [
                    { 'addressTo.name': name },
                    { 'addressFrom.name': name }
                ]
            };
        }
        else if (city) {
            query = {
                $or: [
                    { 'addressTo.city': city },
                    { 'addressFrom.city': city }
                ]
            };
        }
        const searchResults = await ordersCollection.find(query).toArray();

        res.status(200).json(searchResults);
    } catch (error) {
        console.error('Error searching parcels:', error);
        res.status(500).json({ error: 'Internal Server Error' });
    }
});





module.exports = router;