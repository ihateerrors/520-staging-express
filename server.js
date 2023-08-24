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

// Middleware setup
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));
app.set('view engine', 'ejs'); 
app.use(express.static(path.join(__dirname, 'public')));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.locals.moment = require('moment');

// Session, flash and passport setup
app.use(session({
    secret: process.env.SESSION_SECRET,
    resave: false,
    saveUninitialized: false
}));
app.use(flash());

app.use(passport.initialize());
app.use(passport.session());

// Sending flash messages to all routes
app.use((req, res, next) => {
    res.locals.success_msg = req.flash('success_msg');
    res.locals.error_msg = req.flash('error_msg');
    next();
});

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

// Routes setup should come after the middleware
const registerRoutes = require('./routes/register'); 
app.use('/', registerRoutes);

const loginRoutes = require('./routes/login'); 
app.use('/', loginRoutes);

const projectRoutes = require('./routes/projects');
app.use(projectRoutes);


app.get('/', async (req, res) => {
    try {
        // Get the most recent project with bannerContent set to 'yes'
        const project = await Project.findOne({ bannerContent: 'yes' }).sort({ postDate: -1 });

        if (!project) {
            // Handle the scenario where no project with 'yes' for bannerContent is found
            // You can simply render the index page without the project details or show a placeholder
            return res.render('index', { title: '520 Construction Corner', header: 'Welcome to the 520 Construction Corner!' });
        }

        res.render('index', { title: '520 Construction Corner', header: 'Welcome to the 520 Construction Corner!', project });
    } catch (error) {
        console.error(error);
        res.status(500).send('Internal Server Error');
    }
});


// Universal route handler for static pages
app.get('/:page', (req, res, next) => {
    const pageName = req.params.page;
    const viewPath = path.join(__dirname, 'views', `${pageName}.ejs`);

    fs.exists(viewPath, (exists) => {
        if (exists) {
            res.render(pageName);
        } else {
            next(); // Pass control to the next handler, which could be your 404 page
        }
    });
});


// catch-all route -- keep this at the bottom so it doesn't interfere with specific routes
app.get('/projectDetails', (req, res) => {
    // Redirect to an error page or a specific project
    res.redirect('/projectDetails');
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
