
//scripts/models/Customer.js

const mongoose = require('mongoose');

const customerSchema = new mongoose.Schema({
    id: { type: String, required: true, unique: true },
    name: { type: String, required: true },
    email: { type: String, required: true, unique: true },
    image_url: { type: String },
  });
  
  const Customer = mongoose.models.Customer || mongoose.model('Customer', customerSchema);

    module.exports = Customer;



    