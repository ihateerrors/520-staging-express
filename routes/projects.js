const express = require('express');
const multer = require('multer');
const router = express.Router();
const { uploadToAzure } = require('../utils/azureUpload'); 
const Project = require('../models/Project');
const ensureAuthenticated = require('../middlewares/auth');

// Using memoryStorage to keep the uploaded file in memory
const storage = multer.memoryStorage();
const upload = multer({ storage: storage });

// Protect the route and render the form to the user
router.get('/projectForm', ensureAuthenticated, (req, res) => {
    res.render('projectForm'); // Assuming your form view is named 'projectForm.ejs'
});

router.post('/api/projects', ensureAuthenticated, upload.single('file'), async (req, res) => {
    try {
        if (req.file && req.file.buffer) {
            const azureFileUrl = await uploadToAzure(req.file.buffer, req.file.originalname);
            console.log(azureFileUrl);
            req.body.imageUrl = azureFileUrl;  // Saves the URL to the image in database
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

// Route to fetch and display project details
router.get('/projects/:projectId', ensureAuthenticated, async (req, res) => {
    try {
        // Fetch the project by its ID
        const project = await Project.findById(req.params.projectId);
        res.render('projectDetails', { project });

        // If project not found
        if (!project) {
            req.flash('error_msg', 'Project not found.');
            return res.redirect('/someErrorPageOrHomePage'); // Replace with your actual error page or home page route
        }

        // Render an EJS template with the project data
        res.render('projectDetails', { project }); // Assuming your details view is named 'projectDetails.ejs'
    } catch (err) {
        console.error('Error:', err);
        req.flash('error_msg', 'Internal server error.');
        res.redirect('/someErrorPageOrHomePage'); // Replace with your actual error page or home page route
    }
});




module.exports = router;

