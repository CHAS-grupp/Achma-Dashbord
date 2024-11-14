


// scripts/db.js

require('dotenv').config(); // Ladda .env-filen
const mongoose = require('mongoose');

// Hämta din MongoDB-anslutningssträng från miljövariabel
const uri = process.env.DATABASE;

const connectDB = async () => {
  try {
    if (mongoose.connection.readyState >= 1) {
      console.log('Already connected to MongoDB');
      return;
    }
    await mongoose.connect(uri, {
      serverSelectionTimeoutMS: 5000, // Timeout efter 5 sekunder
    });
    console.log('Connected successfully to MongoDB with Mongoose');
  } catch (e) {
    console.error('Connection error:', e);
    throw new Error('Failed to connect to MongoDB');
  }
};

// Exportera funktionen för att ansluta till MongoDB
module.exports = connectDB;




