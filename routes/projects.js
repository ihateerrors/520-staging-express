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
const propertiesReader = require('properties-reader');
const messages = propertiesReader('message.properties');

const validateProjectIdFromRequest = (projectId) => projectId && typeof projectId === 'string' && projectId.length === 10;

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


router.get('/projects/:slug', async (req, res) => {
    try {
        const slug = req.params.slug;

        if (!slug || typeof slug !== 'string') {
            res.status(400).send('Invalid slug');
            return;
        }

        const project = await Project.findOne({ slug: slug });

        if (!project) {
            res.status(404).send('Project not found');
            return;
        }

        const activityTypeEnums = Project.schema.path('activityType').caster.enumValues;
        const timingFeatureEnums = Project.schema.path('timingFeatures').caster.enumValues;

        const activityType = activityTypeEnums.map((activityType) => {
            const key = `activityType.${activityType}`;
            const message = messages.get(key);
            return { id: activityType, message: message };
        });

        const timingFeatures = timingFeatureEnums.map((timingFeature) => {
            const key = `timingFeature.${timingFeature}`;
            const message = messages.get(key);
            return { id: timingFeature, message: message };
        });

        const projectData = {
            ...project.toObject(),
            activityType,
            timingFeatures
        };

        res.render('projectDetails', { project: projectData, formatDate });
    } catch (error) {
        console.error(error);
        res.status(500).send('Internal Server Error');
    }
});

const isValidDate = (date) => date && date instanceof Date;

router.get('/api/projects', async (req, res) => {
    console.log("Entered /api/projects route");
    try {
        const filters = [];
        // Dates from query parameters are in ISO format
        const startDate = new Date(req.query.startDate);
        const endDate = new Date(req.query.endDate);
        
        if (isValidDate(startDate) && isValidDate(endDate)) { 
            filters.push({
                $or: [{
                    startDate: { $lte: endDate.toISOString() },
                    endDate: { $gte: startDate.toISOString() }
                }]
            })
        } else if (isValidDate(startDate)) {
            filters.push({ endDate: { $gte: startDate.toISOString() } });
        } else if (isValidDate(endDate)) {
            filters.push({ startDate: { $lte: endDate.toISOString() } });
        } else {
            console.error("Invalid start and end date");
            res.status(400).json({ message: 'Invalid start and end date' });
            return;
        }

        if (req.query.types) {
            if (req.query.types === "all") {
                filters.push({ activityType: { $in: [
                    // if you add a new activity type, add it here
                    "fullHighway",
                    "partialHighway",
                    "streetAndLane",
                    "trail",
                    "ramp",
                    "highImpact"
                ] } })
            } else {
                filters.push({ activityType: { $in: req.query.types.split(",") } })
            }
        }

        // if (req.query.cameras) {
		// 	filters.cameras = req.query.cameras === "true";
		// }

        const projects = await Project.find({ $and: filters });
        res.json(projects);
    } catch (error) {
        console.error(error);
        res.status(500).send("Internal Server Error");
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

        const dateFields = ['startDate', 'endDate', 'postDate', 'removeDate'];
        const dates = {};
        // Converting date strings to ISO format
        dateFields.forEach((field) => {
            if (req.body[field]) {
                const date = new Date(req.body[field]);
                const isoDate = date.toISOString();
                if (isoDate === 'Invalid Date') {
                    throw new Error('Invalid date for field:', field);
                }
                dates[field] = isoDate;
            }
        });

        const data = {
            ...req.body,
            ...dates
        };

        // Creating and saving the project
        const project = new Project(data);
        await project.save();
        req.flash('success_msg', 'Construction event created successfully.');
        res.redirect('/dashboard');
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

        if (!validateProjectIdFromRequest(projectId)) {
            res.status(400).send('Invalid Project ID');
            return;
        }

        const project = await Project.findOne({ projectId: projectId });

        if (!project) {
            res.status(404).send('Project not found');
            return;
        }

        if (!project.mapData) {
            res.status(404).send('Map data not found for the project');
            return;
        }

        res.json({
            slug: project.slug,
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

router.get('/api/projects/currentAndUpcoming', async (req, res) => {
    const today = new Date();
    today.setHours(0, 0, 0, 0);  // set to start of the day

    const currentClosures = await Project.find({
        startDate: { $lte: today },
        endDate: { $gte: today }
    }).sort({ postDate: -1 });

    // Get upcoming closures
    const upcomingClosures = await Project.find({
        startDate: { $gt: today }
    }).sort({ postDate: -1 });

    res.json({ currentClosures, upcomingClosures });
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
