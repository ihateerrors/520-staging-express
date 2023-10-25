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

router.put("/api/projects/:id", upload.single("image"), async (req, res) => {
    try {
        const project = await Project.findById(req.params.id);
        if (!project) {
            return res.status(404).json({ error: "Closure not found" });
        }

        Object.keys(req.body).forEach(key => {
            if (req.body[key] && project[key] !== undefined) {
                project[key] = req.body[key];
            }
        });

        ["startDate", "endDate", "postDate", "removeDate", "createdAt", "updatedAt"].forEach(dateKey => {
            if (req.body[dateKey]) {
                project[dateKey] = new Date(req.body[dateKey]);
            }
        });

        if (req.file) {
            const imageUrl = await uploadToAzure(req.file.buffer, req.file.originalname);
            project.imageUrl = imageUrl;
        }

        ["timingFeatures", "activityType", "impactType"].forEach(key => {
            if (req.body[key] && typeof req.body[key] === "string") {
                project[key] = req.body[key].split(",").map(item => item.trim());
            }
        });

        await project.save();
        res.json(project);
    }  catch (error) {
        console.error("Error while updating closure:", error);
        res.status(500).json({ error: "Internal server error while updating closure.", detailedError: error.message });
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

router.delete("/api/projects/:id", async (req, res) => {
    try {
        const project = await Project.findByIdAndDelete(req.params.id);
        if (!project) {
            return res.status(404).json({ error: "Closure not found" });
        }
        res.json(project);
    } catch (error) {
        res.status(500).json({ error: "Internal server error while deleting closure." });
    }
});

module.exports = router;
