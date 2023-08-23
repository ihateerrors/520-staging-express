router.get('/past-events', ensureAuthenticated, async (req, res) => {
    try {
        let events = await Project.find({ userId: req.user._id });
        res.render('pastEvents', { events });
    } catch (error) {
        console.error(error);
        res.status(500).send('Internal Server Error');
    }
});

module.exports = router;
