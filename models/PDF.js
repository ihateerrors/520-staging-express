const mongoose = require('mongoose');

const pdfSchema = new mongoose.Schema({
    montlakeNoiseReportUrl: {
        type: String,
        default: null
    },
    i5NoiseReportUrl: {
        type: String,
        default: null
    },
    newsletterLink: {
        type: String,
        default: null
    },
    // ... any other fields you'd like to associate with the PDFs
});

const PDF = mongoose.model('PDF', pdfSchema);

module.exports = PDF;
