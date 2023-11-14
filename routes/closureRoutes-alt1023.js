const express = require("express");
const router = express.Router();
const multer = require("multer");
const path = require("path");
const Project = require("../models/Project");
const { uploadToAzure } = require("../utils/azureUpload");

const storage = multer.memoryStorage();

function fileFilter(req, file, cb) {
    const allowedTypes = /jpeg|jpg|png|gif/;
    const mimetypeOK = allowedTypes.test(file.mimetype);
    const extnameOK = allowedTypes.test(path.extname(file.originalname).toLowerCase());
    
    if (mimetypeOK && extnameOK) {
        cb(null, true);
    } else {
        cb(new Error("Error: File upload only supports the following filetypes - " + allowedTypes));
    }
}

const upload = multer({ storage: storage, fileFilter: fileFilter });

router.put("/api/projects/:id", upload.single("image"), async (req, res) => {
    try {
        const project = await Project.findById(req.params.id);
        
        if (!project) {
            return res.status(404).json({ error: "Closure not found" });
        }
        
        // Update fields in the project from the request body
        Object.keys(req.body).forEach(key => {
            if (req.body[key]) {
                project[key] = req.body[key];
            }
        });
        
        // If an image file is provided, upload it to Azure and store the URL
        if (req.file) {
            const imageUrl = await uploadToAzure(req.file.buffer, req.file.originalname);
            project.imageUrl = imageUrl;
        }
        
        await project.save();

        res.json(project);
    } catch (err) {
        res.status(500).json({ error: "Internal server error while updating closure.", detailedError: err.message });
    }
});

router.delete("/:id", async (req, res) => {
    try {
        const project = await Project.findByIdAndDelete(req.params.id);
        
        if (!project) {
            return res.status(404).json({ error: "Closure not found" });
        }
        
        res.json(project);
    } catch (err) {
        res.status(500).json({ error: "Internal server error while deleting closure." });
    }
});

module.exports = router;
