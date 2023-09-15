require('dotenv').config();
const express = require('express');
const path = require('path');
const mongoose = require('mongoose');
const app = express();
const session = require('express-session'); 
const flash = require('connect-flash');
const passport = require('passport');
const LocalStrategy = require('passport-local').Strategy;
const bcrypt = require('bcryptjs');
const User = require('./models/User');
const fs = require('fs');
const Project = require('./models/Project');
const { fetchRecentClosures } = require('./routes/projects');
const loginRoutes = require('./routes/login');
const registerRoutes = require('./routes/register'); 
const latestBannerProjectRoute = require('./routes/latest-banner-project');
const { StorageSharedKeyCredential, BlobServiceClient } = require("@azure/storage-blob");

// Middleware setup
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));
app.set('view engine', 'ejs'); 
app.use(express.static(path.join(__dirname, 'public')));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.locals.moment = require('moment');

app.use(registerRoutes);
app.use(loginRoutes);
app.use(latestBannerProjectRoute);

// Session, flash and passport setup
app.use(session({
    secret: process.env.SESSION_SECRET,
    resave: false,
    saveUninitialized: false
}));

app.use(passport.initialize());
app.use(passport.session());
app.use(flash());

const accountName = 'sr520construction';
const accountKey = process.env.AZURE_STORAGE_ACCOUNT_KEY;
const containerName = '520-uploads';

const sharedKeyCredential = new StorageSharedKeyCredential(accountName, accountKey);
const blobServiceClient = new BlobServiceClient(
  `https://${accountName}.blob.core.windows.net`,
  sharedKeyCredential
);

// Passport config 
passport.use(new LocalStrategy({
    usernameField: 'email'
}, async (email, password, done) => {
    const user = await User.findOne({ email });
    if (!user) {
        return done(null, false, { message: 'Invalid email or password.' });
    }

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
        return done(null, false, { message: 'Invalid email or password.' });
    }

    return done(null, user);
}));

passport.serializeUser((user, done) => {
    done(null, user.id);
});

passport.deserializeUser(async (id, done) => {
    const user = await User.findById(id);
    done(null, user);
});

app.get('/', async (req, res) => {
    try {
        const project = await Project.findOne({ bannerContent: 'yes' }).sort({ postDate: -1 });

        // Fetch all relevant closures. Adjust this if you need specific filtering.
        const closures = await Project.find({}).sort({ postDate: -1 });

        // Always pass both the project and closures variables, even if they're null or empty.
        res.render('index', { 
            title: '520 Construction Corner', 
            header: 'Welcome to the 520 Construction Corner!', 
            project,
            closures
        });

    } catch (error) {
        console.error(error);
        res.status(500).send('Internal Server Error');
    }
});



//map Routes


app.get('/program', (req, res) => {
    res.render('program'); // assuming 'program' is the name of your view file
});

app.get('/montlake-project', (req, res) => {
    res.render('montlake-project');
});

app.get('/i5-connection-project', (req, res) => {
    res.render('i5-connection-project');
});

app.get('/portage-bay-project', (req, res) => {
    res.render('portage-bay-project');
});

app.get('/contact', async (req, res) => {
    try {
        const closuresData = await fetchRecentClosures();
        res.render('contact', { closures: closuresData });
    } catch (error) {
        console.error("Error in /contact route:", error);
        res.status(500).send("Server error");
    }
});

app.get('/events', async (req, res) => {
    try {
        const closuresData = await fetchRecentClosures();
        res.render('events', { closures: closuresData });
    } catch (error) {
        console.error("Error in /events route:", error);
        res.status(500).send("Server error");
    }
});

app.get('/latest-closures', async (req, res) => {
    try {
        const closuresData = await fetchRecentClosures(); // This is assuming you've defined fetchRecentClosures() function elsewhere in your code
        res.json(closuresData);
    } catch (error) {
        console.error("Error in /latest-closures route:", error);
        res.status(500).send("Server error");
    }
});
  
// Connect to MongoDB
const apiKey = process.env.DB_API_KEY;
const uri = `mongodb+srv://mkennedy:${apiKey}@cluster0.p0czhw3.mongodb.net/?retryWrites=true&w=majority`;


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
