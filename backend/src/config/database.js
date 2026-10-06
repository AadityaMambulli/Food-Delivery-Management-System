const mongoose = require('mongoose');

const defaultMongoUri = 'mongodb://localhost:27017/food_delivery_db';

async function connectToDatabase() {
  const mongoUri = process.env.MONGODB_URI || defaultMongoUri;
  await mongoose.connect(mongoUri, { serverSelectionTimeoutMS: 5000 });
  console.log(`Connected to MongoDB database "${mongoose.connection.name}"`);
}

module.exports = { connectToDatabase };
