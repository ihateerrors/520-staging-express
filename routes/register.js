const express = require('express');    // Import Express
const router = express.Router();       // Create a new Router object
const User = require('../models/User'); // Assuming the path to the User model is correct

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