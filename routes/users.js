const bcrypt = require('bcrypt');
const saltRounds = 10;

// Hashing a password
bcrypt.hash('myPassword', saltRounds, function(err, hash) {
    // Store hash in database
});

// Comparing a password
bcrypt.compare('myPassword', hash, function(err, result) {
    if(result) {
        // Passwords match
    } else {
        // Passwords don't match
    }
});







