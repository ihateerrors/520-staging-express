const express = require("express");
const router = express.Router();
const multer = require("multer");
const path = require("path");
const Project = require("../models/Project");
const { uploadToAzure } = require("../utils/azureUpload");

const storage = multer.memoryStorage();

function fileFilter(e, r, t) {
    const o = /jpeg|jpg|png|gif/;
    const a = o.test(r.mimetype);
    const s = o.test(path.extname(r.originalname).toLowerCase());

    if (a && s) return t(null, true);

    t(new Error("Error: File upload only supports the following filetypes - " + o));
}

const upload = multer({ storage: storage, fileFilter: fileFilter });

router.put("/api/projects/:id", upload.single("image"), async (e, r) => {
        console.log("PUT request received for:", e.params.id);
    try {
        const t = await Project.findById(e.params.id);
        if (!t) return r.status(404).json({ error: "Closure not found" });

        // Update regular properties
        Object.keys(e.body).forEach(r => {
            if (e.body[r] && t[r] !== undefined) {
                t[r] = e.body[r];
            }
        });

        // Handle dates
        ["startDate", "endDate", "postDate", "removeDate", "createdAt", "updatedAt"].forEach(r => {
            if (e.body[r]) {
                t[r] = new Date(e.body[r]);
            }
        });

        // Handle uploaded image
        if (e.file) {
            const imageUrl = await uploadToAzure(e.file.buffer, e.file.originalname);
            t.imageUrl = imageUrl;
        }

        // Handle checkbox arrays
        ["timingFeatures", "activityType", "impactType"].forEach(r => {
            if (e.body[r]) {
                t[r] = JSON.parse(e.body[r]);
            }
        });

        // Handle mapData
        if (e.body.mapData) {
            t.mapData = JSON.parse(e.body.mapData);
        }

        await t.save();
        r.json(t);
    } catch (e) {
        r.status(500).json({ error: "Internal server error while updating closure.", detailedError: e.message });
    }
});

router.delete("/:id", async (e, r) => {
    try {
        const t = await Project.findByIdAndDelete(e.params.id);
        if (!t) return r.status(404).json({ error: "Closure not found" });
        r.json(t);
    } catch (e) {
        r.status(500).json({ error: "Internal server error while deleting closure." });
    }
});

module.exports = router;
