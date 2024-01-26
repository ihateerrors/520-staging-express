const express = require('express');
const router = express.Router();
const NewsletterLink = require('../models/NewsletterLink'); 

// Route to display the form for updating the newsletter link
router.get('/update-newsletter', async (req, res) => {
    try {
        const newsletterLink = await NewsletterLink.findOne({});
        res.render('update-newsletter', { newsletterLink }); 
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
               const newLink = new NewsletterLink({ url: req.body.url });
            await newLink.save();
        }
        res.redirect('/dashboard'); 
    } catch (error) {
        console.error('Error updating newsletter link:', error);
        res.status(500).send('Internal Server Error');
    }
});

module.exports = router;
