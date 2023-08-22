const express = require('express');
const path = require('path');
const mongoose = require('mongoose');
const Project = require('./models/Project');
const multer  = require('multer');
const app = express();

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
  

  app.post('/api/projects', upload.single('file'), (req, res) => {
    console.log(req.file);  // This will log details of the uploaded file
    const project = new Project({
        ...req.body,
        filePath: req.file.path
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
