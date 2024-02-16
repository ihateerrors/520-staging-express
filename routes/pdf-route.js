const express = require('express');
const mongoose = require('mongoose');
const multer = require('multer');
const router = express.Router();
const { uploadToAzure } = require('../utils/azureUpload');
const storage = multer.memoryStorage();
const upload = multer({ storage: storage });

// Model for the PDFs (assuming you have set it up)
const PDF = require('../models/PDF');  // Adjust path if needed
const NewsletterLink = require("../models/NewsletterLink"); 

async function getNewsletterLink() {
    const newsletterLinkObj = await NewsletterLink.findOne({});
    return newsletterLinkObj ? newsletterLinkObj.url : null;
}

// Route for Montlake Project
router.get('/montlake-project', async (req, res) => {
    const newsletterLink = await getNewsletterLink();
    const latestPDF = await PDF.findOne().sort({ _id: -1 }).limit(1);
    if (latestPDF) {
        console.log("Montlake URL:", latestPDF.montlakeNoiseReportUrl);
        res.render('montlake-project', {
            montlakeUrl: latestPDF.montlakeNoiseReportUrl,
            newsletterLink
        });
    } else {
        console.log("No Montlake URL found.");
        res.render('montlake-project', {
            montlakeUrl: null,
            NewsletterLink
        });
    }
});

// Route for I-5 Connection Project
router.get('/i5-connection-project', async (req, res) => {
    const newsletterLink = await getNewsletterLink();
    const latestPDF = await PDF.findOne().sort({ _id: -1 }).limit(1);
    if (latestPDF) {
        console.log("i5 URL:", latestPDF.i5NoiseReportUrl);
        res.render('i5-connection-project', {
            i5Url: latestPDF.i5NoiseReportUrl,
            newsletterLink
        });
    } else {
        console.log("No i5 URL found.");
        res.render('i5-connection-project', {
            i5Url: null,
            NewsletterLink
        });
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

