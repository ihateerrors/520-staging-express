const express = require("express");
const router = express.Router();
const multer = require("multer");
const path = require("path");
const Project = require('../models/Project');
const { uploadToAzure } = require("../utils/azureUpload");

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

        const data = req.body;
        const updateData = {
            activityName: data.activityName,
            startDate: data.startDate && new Date(data.startDate),
            endDate: data.endDate && new Date(data.endDate),
            time: data.time,
            timingFeatures: data.timingFeatures || [], 
            description: data.description,
            trafficDescription: data.trafficDescription,
            activityType: data.activityType || [],
            impactType: data.impactType || [],
            location: data.location,
            mapData: data.mapData,
            bannerContent: data.bannerContent,
            postDate: data.postDate && new Date(data.postDate),
            removeDate: data.removeDate && new Date(data.removeDate),
            contact: data.contact
        };

        const file = req.file; // The image file after multer middleware
        if (file) {
            const imageUrl = await uploadToAzure(file.buffer, file.originalname);
            updateData.imageUrl = imageUrl;
        }

        project.set(updateData);

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

module.exports = router;
