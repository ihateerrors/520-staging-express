const passport = require('passport');
const express = require('express');    // Import Express
const router = express.Router();       // Create a new Router object


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


router.get('/dashboard', (req, res) => {
    res.render('dashboard', { success_msg: req.flash('success_msg') });
});

module.exports = router;
