const express = require("express");
const router = express.Router();
const multer = require("multer");
const path = require("path");
const Project = require('../models/Project');
const { uploadToAzure, deleteFromAzure } = require("../utils/azureUpload");

const storage = multer.memoryStorage();

function fileFilter(req, file, cb) {
    const allowedExtensions = /jpeg|jpg|png|gif/;
    const mimetypeCheck = allowedExtensions.test(file.mimetype);
    const extnameCheck = allowedExtensions.test(path.extname(file.originalname).toLowerCase());
    if (mimetypeCheck && extnameCheck) {
        return cb(null, true);
    }
    cb(new Error("Error: File upload only supports the following filetypes - " + allowedExtensions));
}

const upload = multer({ storage: storage, fileFilter: fileFilter });

router.put("/api/projects/:projectId", upload.single("image"), async (req, res) => {
    try {
        const projectId = req.params.projectId;
        const project = await Project.findOne({ projectId: projectId });

        if (!project) {
            return res.status(404).json({ error: "Closure not found" });
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
            timingFeatures: req.body.timingFeatures || [],
            activityType: req.body.activityType || [],
            impactType: req.body.impactType || [],
            ...dates
        };

        const file = req.file; // The image file after multer middleware
        if (file) {
            const imageUrl = await uploadToAzure(file.buffer, file.originalname);
            data.imageUrl = imageUrl;
        }

        project.set(data);

        const updatedProject = await project.save();
        res.status(200).json(updatedProject);
    }  catch (error) {
        console.error("Error while updating closure:", error);
        res.status(500).json({ error: "Internal server error while updating closure.", detailedError: error.message });
    }
});

router.delete("/api/projects/:projectId", async (req, res) => {
    try {
        const project = await Project.findOneAndDelete({ projectId: req.params.projectId });
        if (!project) {
            return res.status(404).json({ error: "Closure not found" });
        }
        res.json(project);
    } catch (error) {
        res.status(500).json({ error: "Internal server error while deleting closure." });
    }
});

router.delete("/api/projects/:projectId/image", async (req, res) => {
    const project = await Project.findOne({ projectId: req.params.projectId });
    const blobName = project.imageUrl.split('/').pop();
    const response = await deleteFromAzure(blobName);
    if (!response) {
        return res.status(500).json({ error: "Internal server error while deleting image." });
    }
    project.imageUrl = null;
    await project.save();
    res.status(200).json({ message: "Image deleted successfully" });
});


module.exports = router;
