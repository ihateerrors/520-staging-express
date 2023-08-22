const mongoose = require('mongoose');

const userSchema = new mongoose.Schema({
    name: String,
    description: String,
    // ... other fields ...
});

const User = mongoose.model('User', userSchema);

module.exports = User;
