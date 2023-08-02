const express = require('express');
const path = require('path');
const app = express();
const port = process.env.PORT || 3001;  // use the PORT environment variable if it's available

// Set EJS as the templating engine
app.set('view engine', 'ejs');  

app.use(express.static(path.join(__dirname, 'static')));

// Define the route for the root of the site
app.get('/', (req, res) => {
    res.render('index', { title: '520 Construction Corner', header: 'Welcome to the 520 Construction Corner!' });
});

// Universal route handler
app.get('/:page', (req, res) => {
    res.render(req.params.page, { title: '520 Construction Corner', header: 'Welcome to the 520 Construction Corner!' });
});

// Start the server
app.listen(port, () => {
    console.log(`Server is running on port ${port}`);
});
