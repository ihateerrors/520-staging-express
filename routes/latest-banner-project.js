const router = require('express').Router();
const Project = require('../models/Project'); // Don't forget to import Project model

router.get('/api/latest-banner-project', async (req, res) => {
    try {
        const latestProject = await Project.findOne({ bannerContent: 'yes' }).sort({ createdAt: -1 }).limit(1);
        res.json([latestProject]);  // Wrap the latestProject in an array
    } catch (error) {
        console.error(error);
        res.status(500).send('Internal Server Error');
    }
});

module.exports = router;


