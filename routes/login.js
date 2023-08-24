const passport = require('passport');
const express = require('express');    // Import Express
const router = express.Router();       // Create a new Router object


router.get('/login', (req, res) => {
    res.render('login'); // Assuming you have a 'login.ejs' view in your views directory
});
router.post('/login', passport.authenticate('local', {
    successRedirect: '/projectForm',  // Redirect to project form upon successful login
    failureRedirect: '/login',  // Redirect back to login page upon failure
    failureFlash: true  // Show flash messages for login errors
}));

module.exports = router;
