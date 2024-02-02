const mongoose = require('mongoose');

const newsletterLinkSchema = new mongoose.Schema({
    url: {
        type: String,
        required: true
    }
});

const NewsletterLink = mongoose.model('NewsletterLink', newsletterLinkSchema);

module.exports = NewsletterLink;
