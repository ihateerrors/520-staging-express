const express = require('express');
const mongoose = require('mongoose');
const multer = require('multer');
const router = express.Router();
const { uploadToAzure } = require('../utils/azureUpload'); 
const Project = require('../models/Project');
const ensureAuthenticated = require('../middlewares/auth');
const formatDate = require('../utils/dateHelpers');

// Using memoryStorage to keep the uploaded file in memory
const storage = multer.memoryStorage();
const upload = multer({ storage: storage });

router.get('/api/test', (req, res) => res.send('Test successful!'));

router.get('/api/projects', async (req, res) => {
    console.log("Entered /api/projects route");
    try {
        let filters = {};

        // Check for the presence of query parameters and set filters
        if (req.query.startDate) filters.startDate = { $gte: new Date(req.query.startDate) };
        if (req.query.endDate) filters.endDate = { $lte: new Date(req.query.endDate) };
        if (req.query.types) filters.constructionType = { $in: req.query.types.split(",") }; // assuming you've a `constructionType` field in your model
        if (req.query.cameras) filters.cameras = req.query.cameras === 'true'; // assuming you've a `cameras` field in your model

        // If there are no query parameters, it will fetch all projects
        const projects = await Project.find(filters);

        res.json(projects);
    } catch (error) {
        console.error(error);
        res.status(500).send('Internal Server Error');
    }
});


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

// router.get('/projects/:projectId', async (req, res) => {
//     try {
//         const projectId = req.params.projectId;

//         // Check if projectId is a valid ObjectId
//         if (!mongoose.Types.ObjectId.isValid(projectId)) {
//             res.status(400).send('Invalid Project ID');
//             return;
//         }

//         const project = await Project.findById(projectId);

//         if (!project) {
//             res.status(404).send('Project not found');
//             return;
//         }

//         res.render('projectDetails', { project, formatDate });
//     } catch (error) {
//         console.error(error);
//         res.status(500).send('Internal Server Error');
//     }
// });

router.get('/projects/:id', async (req, res) => {
    try {
        const project = await Project.findById(req.params.id);
        if (!project) {
            return res.status(404).json({ msg: 'Project not found' });
        }
        res.json(project);
    } catch (error) {
        console.error(error.message);
        if (error.kind == 'ObjectId') {
            return res.status(404).json({ msg: 'Project not found' });
        }
        res.status(500).send('Server error');
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


// Utility function to fetch recent closures

const fetchRecentClosures = async () => {
    try {
        return await Project.find({ /* Your conditions here if any */ }).limit(10);
    } catch (error) {
        console.error("Error fetching recent closures:", error);
        throw error;
    }
};

module.exports = {
    router,
    fetchRecentClosures,
    upload
};
