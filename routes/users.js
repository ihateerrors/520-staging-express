const bcryptjs = require('bcryptjs');
const saltRounds = 10;

// Hashing a password
bcryptjs.hash('myPassword', saltRounds, function(err, hash) {
    // Store hash in database
});

// Comparing a password
bcryptjs.compare('myPassword', hash, function(err, result) {
    if(result) {
        // Passwords match
    } else {
        // Passwords don't match
    }
});







