const { MongoClient } = require("mongodb");
const client = new MongoClient("mongodb://127.0.0.1:27017");
let database;
async function connectToMongoDB() {
    try {
        await client.connect();
        console.log("Connected to MongoDB");
        database = client.db('Delivery-Tracker')
    } catch (error) {
        console.error("Error connecting to MongoDB:", error);
    }
}

function getClient() {
    return database;
}

module.exports = { connectToMongoDB, getClient, database };

