require('dotenv').config();

const express = require('express');
const path = require('path');
const mongoose = require('mongoose');
const Project = require('./models/Project');
const multer  = require('multer');
const app = express();

const { BlobServiceClient, StorageSharedKeyCredential } = require('@azure/storage-blob');

const accountName = '520construction';
const accountKey = AZURE_STORAGE_ACCOUNT_KEY;
const containerName = '520-uploads';

const sharedKeyCredential = new StorageSharedKeyCredential(accountName, accountKey);
const blobServiceClient = new BlobServiceClient(
  `https://${accountName}.blob.core.windows.net`,
  sharedKeyCredential
);

const uploadToAzure = require('./azureUpload');


// Connect to MongoDB Atlas
const uri = 'mongodb+srv://mkennedy:T7Sj9quazfsg870Y@cluster0.p0czhw3.mongodb.net/?retryWrites=true&w=majority';

// Middleware setup
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));
app.set('view engine', 'ejs');  // Set EJS as the templating engine
app.use(express.static(path.join(__dirname, 'public')));
app.use(express.json());  // Parse JSON payloads
app.use(express.urlencoded({ extended: true }));  // Parse URL-encoded form data

// Routes setup
app.get('/', (req, res) => {
    res.render('index', { title: '520 Construction Corner', header: 'Welcome to the 520 Construction Corner!' });
});

app.get('/:page', (req, res) => {
    res.render(req.params.page, { title: '520 Construction Corner', header: 'Welcome to the 520 Construction Corner!' });
});

app.get('/addProject', (req, res) => {
    res.render('projectForm');
});

// Configure storage
const storage = multer.diskStorage({
    destination: function (req, file, cb) {
      cb(null, './uploads/')
    },
    filename: function (req, file, cb) {
      cb(null, Date.now() + '-' + file.originalname)
    }
  });
  
  const upload = multer({ storage: storage });
  

  app.post('/api/projects', upload.single('file'), async (req, res) => {
    if (req.file && req.file.buffer) {
        const url = await uploadToAzure(req.file.buffer, req.file.originalname);
        req.body.imageUrl = url;  // Saves the URL to the image in database
    }
   });

    project.save()
        .then(savedProject => {
            res.status(200).redirect('/');
        })
        .catch(err => {
            console.error('Error:', err);
            if (err.name === 'ValidationError') {
                let errorMessages = Object.values(err.errors).map(e => e.message);
                res.status(400).send({ errors: errorMessages });
            } else {
                res.status(500).send('Internal server error');
            }
        });


mongoose.connect(uri, { 
    useNewUrlParser: true, 
    useUnifiedTopology: true 
});

mongoose.connection.on('connected', () => {
    console.log('Connected to MongoDB Atlas');
});

mongoose.connection.on('error', (err) => {
    console.error('Error connecting to MongoDB Atlas:', err);
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`);
});
