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
    trafficDescription: {
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
            "High-impact construction",
            "Cameras"
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
        type: String,  // saves to Azure database which generates the URL stored in MongoDB
        required: false
    },
    location: {
        type: String,
        required: false
    },
    // mapData: {
    //     type: {
    //         type: String,
    //         enum: ['FeatureCollection', 'Feature', 'Point', 'LineString', 'Polygon'],
    //         required: false
    //     },
    //     features: {
    //         type: [mongoose.Schema.Types.Mixed]
    //     }
    // },

    // mapData: {
    //     type: {
    //         type: mongoose.Schema.Types.Mixed,
    //         enum: ['FeatureCollection', 'Feature', 'Point', 'LineString', 'Polygon'],
    //         required: false
    //     },
    //     features: [{
    //         type: {
    //             type: mongoose.Schema.Types.Mixed,
    //             enum: ['Feature', 'Point', 'LineString', 'Polygon']
    //         },
    //         properties: {
    //             type: mongoose.Schema.Types.Mixed,
    //             default: {}
    //         },
    //         geometry: {
    //             type: {
    //                 type: mongoose.Schema.Types.Mixed,
    //                 enum: ['Point', 'LineString', 'Polygon']
    //             },
    //             coordinates: [mongoose.Schema.Types.Mixed]
    //         }
    //     }]
    // },

    mapData: {
        type: mongoose.Schema.Types.Mixed
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
        enum: ['address1', 'address2', 'address3'],  // Placeholder enum values - replace these with actual values
        required: false
    }
}, { timestamps: true });

const Project = mongoose.model('Project', projectSchema);

module.exports = Project;
