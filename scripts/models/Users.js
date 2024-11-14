
//script/model/Users.js

const mongoose = require('mongoose');

const { Schema } = mongoose;

const userSchema = new Schema({
  email: { type: String, required: true, unique: true },
  name: String,
  
});


const User = mongoose.models.User || mongoose.model('User', userSchema);

module.exports = User;



