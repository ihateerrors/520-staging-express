const express = require('express');
const router = express.Router();
const NewsletterLink = require('../models/NewsletterLink'); 

// Route to display the form for updating the newsletter link
router.get('/sitewide-links', async (req, res) => {
    try {
        const newsletterLink = await NewsletterLink.findOne({});
        res.render('sitewide-links', { newsletterLink }); // Render a view with a form for updating the link
    } catch (error) {
        console.error('Error fetching newsletter link:', error);
        res.status(500).send('Internal Server Error');
    }
});

// Route to handle the form submission and update the newsletter link
router.post('/update-newsletter-link', async (req, res) => {
    try {

        const linkObj = await NewsletterLink.findOne({});
        if (linkObj) {
            linkObj.url = req.body.url;
            await linkObj.save();
        } else {
            // If it doesn't exist, create a new one
            const newLink = new NewsletterLink({ url: req.body.url });
            await newLink.save();
        }
        res.redirect('/dashboard'); // after updating
    } catch (error) {
        console.error('Error updating newsletter link:', error);
        res.status(500).send('Internal Server Error');
    }
});

module.exports = router;