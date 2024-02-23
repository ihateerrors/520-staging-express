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
const multer = require('multer');
const storage = multer.memoryStorage(); // Use memory storage to handle the file in a buffer
const upload = multer({ storage: storage });
const Project = require('./models/Project');
const NewsletterLink = require('./models/NewsletterLink');
const { fetchRecentClosures } = require('./routes/projects');
const { StorageSharedKeyCredential, BlobServiceClient } = require("@azure/storage-blob");
const pdfRoutes = require('./routes/pdf-route'); // Path may vary based on your directory structure
const propertiesReader = require('properties-reader');
const messages = propertiesReader('message.properties');

// Routes imports
const loginRoutes = require('./routes/login');
const registerRoutes = require('./routes/register');
const latestBannerProjectRoute = require('./routes/latest-banner-project');
const projectRoutes = require('./routes/projects');
const closureRoutes = require('./routes/closureRoutes');
const newsletterRoutes = require('./routes/newsletterRoutes'); 

// Middleware setup

app.use('/uploads', express.static(path.join(__dirname, 'uploads')));
app.use(express.static(path.join(__dirname, 'public')));
app.set('view engine', 'ejs'); 
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.locals.moment = require('moment');
app.use((req, _, next) => {
    // Add messages to the request object so they can be accessed in the view
    req.messages = messages;
    next();
});

// Session, flash and passport setup
app.use(session({
    secret: process.env.SESSION_SECRET,
    resave: false,
    saveUninitialized: false,
    cookie: { secure: false } 
}));


app.use(passport.initialize());
app.use(passport.session());
app.use(flash());


app.use(projectRoutes.router);
app.use(registerRoutes);
app.use(loginRoutes);
app.use(latestBannerProjectRoute);
app.use(pdfRoutes);
app.use(closureRoutes);
app.use(newsletterRoutes);

const accountName = 'sr520construction';
const accountKey = process.env.AZURE_STORAGE_ACCOUNT_KEY;
const containerName = '520-uploads';

const dbConnectionString = process.env.DB_API_KEY;

if (!dbConnectionString) {
    throw new Error('Database connection string is not set');
}

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
        const newsletterLinkObj = await NewsletterLink.findOne({});
        const newsletterLink = newsletterLinkObj ? newsletterLinkObj.url : null;
        const project = await Project.findOne({ bannerContent: 'yes' }).sort({ postDate: -1 });

        const today = new Date();
        today.setHours(0, 0, 0, 0);  // set to start of the day

        // Get current closures
        const currentClosures = await Project.find({
            startDate: { $lte: today },
            endDate: { $gte: today }
        }).sort({ postDate: -1 });

        // Get upcoming closures
        const upcomingClosures = await Project.find({
            startDate: { $gte: today }
        }).sort({ postDate: -1 });

        res.render('index', {
            title: '520 Construction Corner',
            header: 'Welcome to the 520 Construction Corner!',
            project,
            closures: [...currentClosures, ...upcomingClosures],  // combines both lists, though you may not need to do this
            currentClosures, 
            upcomingClosures,
            messages: req.messages,
            newsletterLink
        });

    } catch (error) {
        console.error(error);
        res.status(500).send('Internal Server Error');
    }
});

app.get('/portage-bay-project', (req, res) => {
    res.render('portage-bay-project');
});

// Define redirects for specific paths
app.get('/FutureConstructionProjects', (req, res) => {
    res.redirect('https://sr520construction.com/');
});

app.get('/ManagingConstructionEffects', (req, res) => {
    res.redirect('https://sr520construction.com/');
});

app.get('/ConstructionMap', (req, res) => {
    res.redirect('https://sr520construction.com/');
});

// This is the new function to render the static pages but to ensure that the latest newsletter URL is captured

async function getNewsletterLink() {
    const newsletterLinkObj = await NewsletterLink.findOne({});
    return newsletterLinkObj ? newsletterLinkObj.url : null;
}
  
app.get('/program', async (req, res) => {
const newsletterLink = await getNewsletterLink();
res.render('program', { newsletterLink });
});
  
app.get('/portage-bay-project', async (req, res) => {
const newsletterLink = await getNewsletterLink();
res.render('portage-bay-project', { newsletterLink });
});
  
app.get('/i5-connection-project', async (req, res) => {
const newsletterLink = await getNewsletterLink();
res.render('i5-connection-project', { newsletterLink });
});
  
app.get('/montlake-project', async (req, res) => {
const newsletterLink = await getNewsletterLink();
res.render('montlake-project', { newsletterLink });
});
  
app.get('/contact', async (req, res) => {
try {
    const closuresData = await fetchRecentClosures();
    const newsletterLink = await getNewsletterLink();
    res.render('contact', { closures: closuresData, newsletterLink });
} catch (error) {
    console.error("Error in /contact route:", error);
    res.status(500).send("Server error");
}
});
  
app.get('/events', async (req, res) => {
try {
    const closuresData = await fetchRecentClosures();
    const newsletterLink = await getNewsletterLink();
    res.render('events', { closures: closuresData, newsletterLink });
} catch (error) {
    console.error("Error in /events route:", error);
    res.status(500).send("Server error");
}
});

mongoose.connect(dbConnectionString, { 
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
