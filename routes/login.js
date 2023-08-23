// Login
router.post('/login', passport.authenticate('local', {
    successRedirect: '/projectForm',  // Redirect to project form upon successful login
    failureRedirect: '/login',  // Redirect back to login page upon failure
    failureFlash: true  // Show flash messages for login errors
}));

module.exports = router;
