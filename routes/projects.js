const express = require('express');
const mongoose = require('mongoose');
const multer = require('multer');
const router = express.Router();
const { uploadToAzure } = require('../utils/azureUpload');
const Project = require('../models/Project');
const formatDate = require('../utils/dateHelpers');
const ensureAuthenticated = require('../middlewares/auth');

const storage = multer.memoryStorage();
const upload = multer({ storage: storage });

router.get('/api/test', (req, res) => res.send('Test successful!'));



router.get('/projects/:projectId', async (req, res) => {
    try {
        const projectId = req.params.projectId;

        if (!mongoose.Types.ObjectId.isValid(projectId)) {
            res.status(400).send('Invalid Project ID');
            return;
        }

        const project = await Project.findById(projectId);

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

router.get('/api/projects', async (req, res) => {
    console.log("Entered /api/projects route");
    try {
        let filters = {};

        if (req.query.startDate) filters.startDate = { $gte: new Date(req.query.startDate) };
        if (req.query.endDate) filters.endDate = { $lte: new Date(req.query.endDate) };
        if (req.query.types) filters.constructionType = { $in: req.query.types.split(",") };
        if (req.query.cameras) filters.cameras = req.query.cameras === 'true';

        const projects = await Project.find(filters);
        res.json(projects);
    } catch (error) {
        console.error(error);
        res.status(500).send('Internal Server Error');
    }
});

router.get('/projectForm', ensureAuthenticated, (req, res) => {
    res.render('projectForm', { 
        success_msg: req.flash('success_msg'), 
        error_msg: req.flash('error_msg')
    });
});

router.post('/api/projects', upload.single('file'), async (req, res) => {
    try {
        // Handling file upload
        if (req.file && req.file.buffer) {
            const azureFileUrl = await uploadToAzure(req.file.buffer, req.file.originalname);
            console.log(azureFileUrl);
            req.body.imageUrl = azureFileUrl;  // Saves the URL to the image in the database
        }

        // Conditional parsing of mapData
        if (typeof req.body.mapData === 'string') {
            try {
                console.log("Raw mapData:", req.body.mapData);
                req.body.mapData = JSON.parse(req.body.mapData);
            } catch (error) {
                console.error('Failed to parse mapData:', error);
                req.flash('error_msg', 'Failed to parse mapData.');
                return res.redirect('/projectForm');
            }
        }

        // Creating and saving the project
        const project = new Project(req.body);
        await project.save();
        req.flash('success_msg', 'Construction event created successfully.');
        res.redirect('/projectForm');
    } catch (err) {
        console.error('Error:', err);
        
        // Handle validation error
        if (err.name === 'ValidationError') {
            let errorMessages = Object.values(err.errors).map(e => e.message);
            req.flash('error_msg', 'Error in creating the event: ' + errorMessages.join(', '));
            res.redirect('/projectForm');
        } else {
            req.flash('error_msg', 'Internal server error, yo');
            res.redirect('/projectForm');
        }
    }
});


router.get('/api/projects/:projectId/mapData', async (req, res) => {
    try {
        const projectId = req.params.projectId;

        if (!mongoose.Types.ObjectId.isValid(projectId)) {
            res.status(400).send('Invalid Project ID');
            return;
        }

        const project = await Project.findById(projectId);

        if (!project) {
            res.status(404).send('Project not found');
            return;
        }

        if (!project.mapData) {
            res.status(404).send('Map data not found for the project');
            return;
        }

        res.json({
            _id: project._id,
            mapData: project.mapData
        });
    } catch (error) {
        console.error(error);
        res.status(500).send('Internal Server Error');
    }
});



router.get('/', async (req, res) => {
    try {
        const closures = await Project.find({}).limit(10);
        res.render('index', { closures: closures });
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

const fetchRecentClosures = async () => {
    try {
        return await Project.find({}).limit(10);
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
