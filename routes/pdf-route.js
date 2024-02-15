

const express = require("express");
const mongoose = require("mongoose");
const multer = require("multer");
const router = express.Router();
const { uploadToAzure } = require("../utils/azureUpload");
const storage = multer.memoryStorage();
const upload = multer({ storage: storage });
const PDF = require("../models/PDF");
const NewsletterLink = require("../models/NewsletterLink"); 

async function getNewsletterLink() {
    const newsletterLinkObj = await NewsletterLink.findOne({});
    return newsletterLinkObj ? newsletterLinkObj.url : null;
}

router.get("/montlake-project", async (req, res) => {
    const newsletterLink = await getNewsletterLink(); /
    const pdf = await PDF.findOne().sort({ _id: -1 }).limit(1);
    if (pdf) {
        res.render("montlake-project", {
            montlakeUrl: pdf.montlakeNoiseReportUrl,
            newsletterLink // Passes the newsletter link to the template-- MK
        });
    } else {
        res.render("montlake-project", {
            montlakeUrl: null,
            newsletterLink 
        });
    }
});

router.get("/i5-connection-project", async (req, res) => {
    try {
        const newsletterLink = await getNewsletterLink(); 
        const pdf = await PDF.findOne().sort({ _id: -1 });
        res.render("i5-connection-project", {
            i5Url: pdf ? pdf.i5NoiseReportUrl : null,
            newsletterLink 
        });
    } catch (error) {
        console.error("Error fetching I-5 PDF.", error);
        res.status(500).send("Error fetching I-5 PDF.");
    }
});

module.exports = router;
