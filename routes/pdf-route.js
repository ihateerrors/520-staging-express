const express = require('express');
const mongoose = require('mongoose');
const multer = require('multer');
const router = express.Router();
const { uploadToAzure } = require('../utils/azureUpload');
const storage = multer.memoryStorage();
const upload = multer({ storage: storage });

// Model for the PDFs (assuming you have set it up)
const PDF = require('../models/PDF');  // Adjust path if needed

// Route for Montlake Project
router.get('/montlake-project', async (req, res) => {
    const latestPDF = await PDF.findOne().sort({ _id: -1 }).limit(1);
    if (latestPDF) {
        console.log("Montlake URL:", latestPDF.montlakeNoiseReportUrl);
        res.render('montlake-project', {
            montlakeUrl: latestPDF.montlakeNoiseReportUrl
        });
    } else {
        console.log("No Montlake URL found.");
        res.render('montlake-project', {
            montlakeUrl: null
        });
    }
});

// Route for I-5 Connection Project
router.get('/i5-connection-project', async (req, res) => {
    try {
        // Fetch the latest PDF entry from the database
        const latestPDF = await PDF.findOne().sort({ _id: -1 });

        // Render the i5-connection-project view with the fetched I-5 URL
        res.render('i5-connection-project', { i5Url: latestPDF ? latestPDF.i5NoiseReportUrl : null });
    } catch (err) {
        res.status(500).send("Error fetching I-5 PDF.");
    }
});

// Handle PDF uploads
router.post('/pdf-upload', upload.fields([{ name: 'montlakeNoiseReport' }, { name: 'i5NoiseReport' }]), async (req, res) => {
    try {
        let montlakeNoiseReportUrl, i5NoiseReportUrl;

        if (req.files.montlakeNoiseReport) {
            const file = req.files.montlakeNoiseReport[0];
            montlakeNoiseReportUrl = await uploadToAzure(file.buffer, file.originalname);
        }

        if (req.files.i5NoiseReport) {
            const file = req.files.i5NoiseReport[0];
            i5NoiseReportUrl = await uploadToAzure(file.buffer, file.originalname);
        }

        const pdfData = new PDF({
            montlakeNoiseReportUrl,
            i5NoiseReportUrl
        });

        await pdfData.save();

        req.flash('success_msg', 'PDFs uploaded successfully!');
        res.redirect('/pdf-upload');
    } catch (error) {
        req.flash('error_msg', 'There was an error uploading the PDFs.');
        res.redirect('/pdf-upload');
    }
});

router.get('/api/pdfs', async (req, res) => {
    try {
        const pdfs = await PDF.find({});
        res.json(pdfs);  // This will include the PDF URLs
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

module.exports = router;  // Ensure you are exporting the router

