const mongoose = require('mongoose');

const newsLetterSchema = new mongoose.Schema({

    newsLetter: {
        type: String,
        required: true
    },

}, { timestamps: true });

const newsLetter = mongoose.model('newsLetter', newsLetterSchema);

module.exports = newsLetter;
