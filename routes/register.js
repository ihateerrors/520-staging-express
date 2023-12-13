const express = require('express');    // Import Express
const router = express.Router();       // Create a new Router object
const User = require('../models/User'); // Assuming the path to the User model is correct

// At this time there is no user managerment portal. 
// Keeping this route around for convenience in the short-term.

router.post('/register', async (req, res) => {
    console.log(req.body); 
    try {
        const { email, password } = req.body;
        const user = new User({ email, password });
        await user.save();
        res.status(201).send('Registered successfully!');
    } catch (error) {
        res.status(400).send(error);
    }
});

module.exports = router;