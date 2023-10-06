const express = require('express');
const router = express.Router();
const Closure = require('../models/Project');  // Using the correct model

// Endpoint to edit a closure by its ID
router.put('/:id', async (req, res) => {
    try {
        const closure = await Closure.findById(req.params.id);
        
        if (!closure) {
            return res.status(404).send('Closure not found');
        }

        // Convert string dates back to Date objects
        if (req.body.startDate) {
            req.body.startDate = new Date(req.body.startDate);
        }

        if (req.body.endDate) {
            req.body.endDate = new Date(req.body.endDate);
        }

        if (req.body.postDate) {
            req.body.postDate = new Date(req.body.postDate);
        }

        if (req.body.removeDate) {
            req.body.removeDate = new Date(req.body.removeDate);
        }

        if (req.body.createdAt) {
            req.body.createdAt = new Date(req.body.createdAt);
        }

        if (req.body.updatedAt) {
            req.body.updatedAt = new Date(req.body.updatedAt);
        }

        // Merge the updated fields into the closure object
        Object.assign(closure, req.body);

        // Save the updated closure
        await closure.save();

        res.json(closure); // Send the updated closure data back to the client as a response

    } catch (e) {
        console.error('Error updating closure:', e);
        res.status(500).send('Internal server error while updating closure.');
    }
});

// Endpoint to delete a closure by its ID
router.delete('/:id', async (req, res) => {
    try {
        const closure = await Closure.findByIdAndDelete(req.params.id);
        if (!closure) {
            return res.status(404).send('Closure not found');
        }
        res.send(closure);
    } catch (e) {
        console.error('Error deleting closure:', e);
        res.status(500).send('Internal server error while deleting closure.');
    }
});

module.exports = router;
