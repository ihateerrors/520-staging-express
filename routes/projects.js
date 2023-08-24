const express = require('express');
const multer = require('multer');
const router = express.Router();
const { uploadToAzure } = require('../utils/azureUpload'); 
const Project = require('../models/Project');
const ensureAuthenticated = require('../middlewares/auth');
const formatDate = require('../utils/dateHelpers');

// Using memoryStorage to keep the uploaded file in memory
const storage = multer.memoryStorage();
const upload = multer({ storage: storage });

// Protect the route and render the form to the user
router.get('/projectForm', ensureAuthenticated, (req, res) => {
    res.render('projectForm');
});

router.post('/api/projects', ensureAuthenticated, upload.single('file'), async (req, res) => {
    try {
        if (req.file && req.file.buffer) {
            const azureFileUrl = await uploadToAzure(req.file.buffer, req.file.originalname);
            console.log(azureFileUrl);
            req.body.imageUrl = azureFileUrl;  // Saves the URL to the image in the database
        }

        const project = new Project(req.body);
        await project.save();
        req.flash('success_msg', 'Construction event created successfully.');
        res.redirect('/projectForm');
    } catch (err) {
        console.error('Error:', err);
        if (err.name === 'ValidationError') {
            let errorMessages = Object.values(err.errors).map(e => e.message);
            req.flash('error_msg', 'Error in creating the event: ' + errorMessages.join(', '));
            res.redirect('/projectForm');
        } else {
            req.flash('error_msg', 'Internal server error.');
            res.redirect('/projectForm');
        }
    }
});
router.get('/', async (req, res) => {
    try {
        const closures = await Project.find({ /* Your conditions here if any */ }).limit(10); 
        res.render('index', { closures: closures });
    } catch (error) {
        console.error(error);
        res.status(500).send('Internal Server Error');
    }
});

router.get('/projects/:projectId', async (req, res) => {
    try {
        const projectId = req.params.projectId;
        const project = await Project.findById(projectId); // assuming Project is your model

        if (!project) {
            res.status(404).send('Project not found');
            return;
        }

        res.render('projectDetails', { project, formatDate });
    } catch (error) {
        console.error(error);
        res.status(500).send('Internal Server Error');
    }
});

router.get('/latest-closures', async (req, res) => {
    try {
        const today = new Date();
        today.setHours(0, 0, 0, 0);

        const closures = await Project.find({
            endDate: { $gte: today }, 
            postDate: { $lte: today }
        })
        .sort({ postDate: -1 }) // This sorts by postDate in descending order.
        .limit(4)
        .exec();

        res.json(closures);
    } catch (error) {
        console.error(error);
        res.status(500).send('Internal Server Error');
    }
});

module.exports = router;


