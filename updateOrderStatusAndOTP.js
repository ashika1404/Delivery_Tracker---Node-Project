async function updateOrderStatusAndOTP(ordersCollection, trackingID, status, otp) {
    const allowedUpdates = { status, otp };
    const updateKeys = Object.keys(allowedUpdates);
    const updateObj = {};

    updateKeys.forEach(key => {
        if (allowedUpdates[key] !== undefined) {
            updateObj[key] = allowedUpdates[key];
        }
    });

    const filter = { trackingID: trackingID };
    const update = { $set: updateObj };

    const result = await ordersCollection.updateOne(filter, update);
    return result;
}

module.exports = updateOrderStatusAndOTP;