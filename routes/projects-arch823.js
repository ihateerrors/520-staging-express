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

module.exports = router;
