const express = require("express");
const router = express.Router();
const multer = require("multer");
const path = require("path");
const Project = require("../models/Project");
const { uploadToAzure } = require("../utils/azureUpload");

function fileFilter(req, file, cb) {
    const allowedExtensions = /jpeg|jpg|png|gif/;
    const mimetypeCheck = allowedExtensions.test(file.mimetype);
    const extnameCheck = allowedExtensions.test(path.extname(file.originalname).toLowerCase());
    if (mimetypeCheck && extnameCheck) {
        return cb(null, true);
    }
    cb(new Error("Error: File upload only supports the following filetypes - " + allowedExtensions));
}

// const upload = multer({ storage: storage, fileFilter: fileFilter });



const upload = multer({ storage: multer.memoryStorage() });

// Express route example
router.post('/upload', upload.single('file'), async (req, res) => {
    try {
        if (!req.file) {
            return res.status(400).send('No file uploaded.');
        }

        const fileBuffer = req.file.buffer;
        const fileName = req.file.originalname;
        
        const fileUrl = await uploadToAzure(fileBuffer, fileName);

        res.send({ url: fileUrl });
    } catch (err) {
        res.status(500).send('Error uploading file.');
    }
});



// const upload = multer({ storage: multer.memoryStorage(), fileFilter: fileFilter });


// router.put("/api/projects/:projectId", upload.single("image"), async (req, res) => {
//     try {
//         const project = await Project.findOne({ projectId: req.params.projectId });
//         if (!project) {
//             return res.status(404).json({ error: "Closure not found" });
//         }

//         Object.keys(req.body).forEach(key => {
//             if (req.body[key] && project[key] !== undefined) {
//                 project[key] = req.body[key];
//             }
//         });

//         ["startDate", "endDate", "postDate", "removeDate", "createdAt", "updatedAt"].forEach(dateKey => {
//             if (req.body[dateKey]) {
//                 project[dateKey] = new Date(req.body[dateKey]);
//             }
//         });

//         if (req.file) {
//             const imageUrl = await uploadToAzure(req.file.buffer, req.file.originalname);
//             project.imageUrl = imageUrl;
//         }

//         ["timingFeatures", "activityType", "impactType"].forEach(key => {
//             if (req.body[key] && typeof req.body[key] === "string") {
//                 project[key] = req.body[key].split(",").map(item => item.trim());
//             }
//         });

//         await project.save();
//         res.json(project);
//     }  catch (error) {
//         console.error("Error while updating closure:", error);
//         res.status(500).json({ error: "Internal server error while updating closure.", detailedError: error.message });
//     }
// });

router.put("/api/projects/:id", upload.single("image"), async (req, res) => {
    try {
        // Find the project by the provided ID
        const project = await Project.findById(req.params.id);

        // If the project isn't found, respond with an error
        if (!project) {
            return res.status(404).json({ error: "Closure not found" });
        }

        // Loop through the request body to update the project fields
        Object.keys(req.body).forEach((key) => {
            if (req.body[key] && project[key] !== undefined) {
                project[key] = req.body[key];
            }
        });

        // Update date fields
        ["startDate", "endDate", "postDate", "removeDate", "createdAt", "updatedAt"].forEach((dateField) => {
            if (req.body[dateField]) {
                project[dateField] = new Date(req.body[dateField]);
            }
        });

        // If there's an uploaded file, save it to Azure and update the imageUrl
        if (req.file) {
            const imageUrl = await uploadToAzure(req.file.buffer, req.file.originalname);
            project.imageUrl = imageUrl;
        }

        // Parse and update JSON fields
        ["timingFeatures", "activityType", "impactType"].forEach((jsonField) => {
            if (req.body[jsonField]) {
                project[jsonField] = JSON.parse(req.body[jsonField]);
            }
        });

        // Update map data
        if (req.body.mapData) {
            project.mapData = JSON.parse(req.body.mapData);
        }

        // Save the updated project
        await project.save();

        // Respond with the updated project
        res.json(project);

    } catch (error) {
        console.error(error);
        res.status(500).json({
            error: "Internal server error while updating closure.",
            detailedError: error.message
        });
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
