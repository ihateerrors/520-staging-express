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
        required: true
    },
    activityType: [{
        type: String,
        enum: [
            "Full highway closure",
            "Partial highway closure",
            "Street or lane closure",
            "Trail closure",
            "Ramp closure",
            "High-impact construction"
        ]
    }],
    impactType: [{
        type: String,
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
        type: String,  // This assumes you will be saving a file path or URL to the image. 
        required: false
    },
    // For the map, it depends on how you're storing this. 
    // Assuming you might save a JSON object or a string representation of coordinates
    mapData: {
        type: String, // Or another relevant data type depending on how you save this.
        required: false
    },
    contact: {
        type: String,
        enum: ['address1', 'address2', 'address3'],  // Updated enum values
        required: false
    }
});

const Project = mongoose.model('Project', projectSchema);

module.exports = Project;
