const passport = require('passport');
const express = require('express');    // Import Express
const router = express.Router();       // Create a new Router object
const Project = require('../models/Project');  // Ensure the path is correct according to your project structure

function ensureAuthenticated(req, res, next) {
    if (req.isAuthenticated()) {
        return next();
    } else {
        req.flash('error_msg', 'You are not logged in');
        res.redirect('/login');
    }
}

router.get('/login', (req, res) => {
    res.render('login'); // Assuming you have a 'login.ejs' view in your views directory
});

router.post('/login', (req, res, next) => {
    passport.authenticate('local', (err, user, info) => {
        if (err) return next(err);
        
        if (!user) {
            req.flash('error_msg', info.message);  // assuming 'info' has the error message
            return res.redirect('/login');
        }

        req.logIn(user, (err) => {
            if (err) return next(err);
            
            req.flash('success_msg', 'You are now logged in');
            return res.redirect('/dashboard');
        });

    })(req, res, next);
});

router.get('/dashboard', ensureAuthenticated, async (req, res) => {
    try {
        const closures = await Project.find({}); // Fetch all entries
        res.render('dashboard', { closures, success_msg: req.flash('success_msg') });
    } catch (error) {
        console.error("Error fetching closures:", error);
        res.status(500).send('Internal Server Error');
    }
});

module.exports = router;
