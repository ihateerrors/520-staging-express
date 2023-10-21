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

router.get('/pdf-upload', (req, res) => {
    res.render('pdf-upload');
});

// Handle PDF uploads
router.post('/upload-pdf', upload.fields([{ name: 'montlakeNoiseReport' }, { name: 'i5NoiseReport' }]), async (req, res) => {
    if (req.files.montlakeNoiseReport) {
        const file = req.files.montlakeNoiseReport[0];
        await uploadToAzure(file.buffer, file.originalname);
    }

    if (req.files.i5NoiseReport) {
        const file = req.files.i5NoiseReport[0];
        await uploadToAzure(file.buffer, file.originalname);
    }

    res.redirect('/dashboard'); // Or wherever you'd like to redirect after a successful upload
});



router.get("/dashboard", ensureAuthenticated, async (req, res) => {
    try {
        const projects = await Project.find({});

        // Fetching the enum values from the Project model
        const activityTypeEnums = Project.schema.path('activityType').caster.enumValues;
        const timingFeaturesEnums = Project.schema.path('timingFeatures').caster.enumValues;
        const impactTypeEnums = Project.schema.path('impactType').caster.enumValues;

        // Rendering logic remains the same, but we'll add the enum arrays to the rendered view
        if (projects.length === 0) {
            res.render("dashboard", {
                projects: [],
                allActivityTypes: activityTypeEnums,
                allTimingFeatures: timingFeaturesEnums,
                allImpactTypes: impactTypeEnums,
                message: "No projects available."
            });
        } else {
            res.render("dashboard", {
                projects: projects,
                allActivityTypes: activityTypeEnums,
                allTimingFeatures: timingFeaturesEnums,
                allImpactTypes: impactTypeEnums
            });
        }
    } catch (error) {
        res.status(500).send("Internal Server Error");
    }
});


router.get('/api/test', (req, res) => res.send('Test successful!'));

router.get('/api/projects/mapData', async (req, res) => {
    try {
        // Extract filters from query parameters
        const { startDate, endDate, types } = req.query;

        // Convert types string to an array
        const activityTypes = types ? types.split(",") : [];

        // Formulate the query object
        const query = {};

        if (activityTypes.length && !activityTypes.includes('all')) {
            query.activityType = { $in: activityTypes };
        }

        if (startDate && endDate) {
            query.startDate = { $gte: new Date(startDate) };
            query.endDate = { $lte: new Date(endDate) };
        }

        // Fetch both mapData and activityType from the database
        const projects = await Project.find(query).select('mapData activityType');
        
        res.json({ projects });
    } catch (error) {
        console.error("Error fetching project data:", error);
        res.status(500).json({ error: 'Internal Server Error' });
    }
});

router.post('/api/projects/mapData', async (req, res) => {
    const filters = req.body;
    const activityTypes = filters.activityTypes || [];

    let query = {};

    if (activityTypes.length && !activityTypes.includes('all')) {
        query.activityType = { $in: activityTypes };
    }

    query.startDate = { $gte: new Date(filters.startDate) };
    query.endDate = { $lte: new Date(filters.endDate) };

    try {
        // Fetch both mapData and activityType from the database
        const projects = await Project.find(query).select('mapData activityType');
        res.json({ projects });
    } catch (error) {
        console.error('Error fetching filtered projects:', error);
        res.status(500).json({ error: 'Internal Server Error' });
    }
});


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
        if (req.query.types) filters.activityType = { $in: req.query.types.split(",") };
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
                console.error("Error saving project:", error);
                if ("ValidationError" === error.name) {
                    let messages = Object.values(error.errors).map(e => e.message);
                    return res.status(400).json({ error: "Error in creating the event: " + messages.join(", ") });
                }
                return res.status(500).json({ error: "Internal server error." });
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
