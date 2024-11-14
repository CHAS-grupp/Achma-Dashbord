
//script/model/Revenue.js

const mongoose = require('mongoose');

const revenueSchema = new mongoose.Schema({
    month: { type: String, required: true, unique: true },
    revenue: { type: Number, required: true },
  });
  
  const Revenue = mongoose.models.Revenue || mongoose.model('Revenue', revenueSchema);

  module.exports = Revenue;



  