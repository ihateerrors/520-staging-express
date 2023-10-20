const mongoose = require('mongoose');

const projectSchema = new mongoose.Schema({
    activityName: {
        type: String,
        required: true
    },
    startDate: {
        type: Date,
        required: true
    },
    endDate: {
        type: Date,
        required: false
    },
    time: {
        type: String,
        required: false
    },
    timingFeatures: [{
        type: String,
        enum: ["Around-the-clock", "Nighttime", "Daytime", "Overnight"]
    }],
    description: {
        type: String,
        required: false
    },
    trafficDescription: {
        type: String,
        required: false
    },
    activityType: [{
        type: String,
        enum: [
            "Full highway closure",
            "Partial highway closure",
            "Street and lane closures",
            "Trail closure",
            "Ramp closure",
            "High-impact construction",
            "Cameras"
        ]
    }],
    impactType: [{
        type: String,
        required: false,
        enum: [
            "Bike/pedestrian",
            "Light",
            "Traffic",
            "Dust",
            "Noise",
            "Vibration"
        ]
    }],

    imageUrl: {
        type: String,  // saves to Azure database which generates the URL stored in MongoDB
        required: false
    },
  
    location: {
        type: String,
        required: false
    },

    mapData: {
        type: mongoose.Schema.Types.Mixed,
        required: false
    },
    
    bannerContent: {
        type: String,
        required: true,
        enum: ['yes', 'no']  // It ensures only 'yes' or 'no' values are stored for this field
    },
    postDate: {
        type: Date,
        required: true
    },
    removeDate: {
        type: Date,
        default: null  // If no date is provided, null is set by default
    },
    contact: {
        type: String,
        enum: ['206-777-8885', '206-316-2559', '206-200-9484'],  
        required: false
    }
}, { timestamps: true });

const Project = mongoose.model('Project', projectSchema);

module.exports = Project;
