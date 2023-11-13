const mongoose = require('mongoose');
const slugify = require('slugify');
const { customAlphabet } = require('nanoid');

const alphabet = '0123456789abcdefghijklmnopqrstuvwxyz';
const nanoid = customAlphabet(alphabet, 10);

/**
 * Note: If you add to an enum, you must also add to the message.properties file
 */

const ProjectSchema = new mongoose.Schema({
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
    enum: ["aroundTheClock", "nighttime", "daytime", "overnight"]
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
      "fullHighway",
      "partialHighway",
      "streetAndLane",
      "trail",
      "ramp",
      "highImpact"
    ]
  }],
  impactType: [{
    type: String,
    required: false,
    enum: [
      "bikePedestrian",
      "light",
      "traffic",
      "dust",
      "noise",
      "vibration"
    ]
  }],
  mapFeatures: [{
    type: String,
    required: false,
    enum: ["cameras"]
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
    type: String,
    validate: {
      validator: function(value) {
        try {
          const mapDataObject = JSON.parse(value);
          if (mapDataObject.type === 'FeatureCollection' && Array.isArray(mapDataObject.features)) {
            return true;
          }
          return false;
        } catch (error) {
          return false;
        }
      },
      message: 'Invalid mapData object',
    }
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
    enum: ['montlake', 'i5', 'general'],
    required: false
  },
  projectId: {
    type: String,
    unique: true,
    default: function() {
      return nanoid();
    }
  },
  slug: {
    type: String,
    required: true
  }
}, { timestamps: true });

ProjectSchema.pre('validate', async function(next) {
  // Generate a slug from the title
  const originalSlug = slugify(this.activityName, { lower: true, strict: true });
  // Check if the generated slug already exists in the database
  let count = 1;
  let slug = originalSlug;
  while (true) {
    const existingDocument = await this.constructor.findOne({ slug });
    if (!existingDocument || existingDocument._id.equals(this._id)) {
      // No document with this slug exists, or it exists but it's the same document
      break;
    }
    // Append a number to the original slug to make it unique
    count++;
    slug = `${originalSlug}-${count}`;
  }
  // Set the unique slug
  this.slug = slug;
  next();
});

const Project = mongoose.model('Project', ProjectSchema);

module.exports = Project;
