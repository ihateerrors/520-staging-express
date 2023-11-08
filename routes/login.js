const passport = require('passport');
const express = require('express');    // Import Express
const router = express.Router();       // Create a new Router object
const Project = require('../models/Project');  // Ensure the path is correct according to your project structure
const propertiesReader = require('properties-reader');
const messages = propertiesReader('message.properties');

function ensureAuthenticated(req, res, next) {
    if (req.isAuthenticated()) {
        return next();
    } else {
        req.flash('error_msg', 'You are not logged in');
        res.redirect('/login');
    }
}

router.get('/login', (req, res) => {
    res.render('login', { messages: req.flash() });
});

router.post('/login', (req, res, next) => {
    passport.authenticate('local', (err, user, info) => {
        if (err) return next(err);
        
        if (!user) {
            req.flash('error_msg', info.message);  // assuming 'info' has the error message
            return res.redirect('/login');
        }

        req.logIn(user, (err) => {
            if (err) return next(err);
            
            req.flash('success_msg', 'You are now logged in');
            return res.redirect('/dashboard');
        });

    })(req, res, next);
});

router.get('/dashboard', ensureAuthenticated, async (req, res) => {
    try {
        const closures = await Project.find({}); // Fetch all entries
        const timingFeatureEnums = Project.schema.path('timingFeatures').caster.enumValues;
        const activityTypeEnums = Project.schema.path('activityType').caster.enumValues;
        const impactTypeEnums = Project.schema.path('impactType').caster.enumValues;

        const timingFeatures = timingFeatureEnums.map((timingFeature) => {
            const key = `timingFeature.${timingFeature}`;
            const message = messages.get(key);
            return { id: timingFeature, message: message };
        });

        const activityTypes = activityTypeEnums.map((activityType) => {
            const key = `activityType.${activityType}`;
            const message = messages.get(key);
            return { id: activityType, message: message };
        });

        const impactTypes = impactTypeEnums.map((impactType) => {
            const key = `impactType.${impactType}`;
            const message = messages.get(key);
            return { id: impactType, message: message };
        });

        if (closures.length === 0) {
            res.render('dashboard', { closures, timingFeatures, activityTypes, impactTypes, message: 'No closures available.' });
            return;
        }

        res.render('dashboard', { closures, timingFeatures, activityTypes, impactTypes });
    } catch (error) {
        console.error("Error fetching closures:", error);
        res.status(500).send('Internal Server Error');
    }
});

module.exports = router;
