const mongoose = require('mongoose');
const validator = require('validator');

// example object
// var user = {
//     email: 'arthur@example.com',
//     password: 'myPass123asdflksjdf3948fj9fr8',
//     tokens: [{
//         access: 'auth',
//         token: 'powiefjpwqoefijwepf343498'
//     }]
// }

var User = mongoose.model('User', {
    email: {
        type: String,
        required: true,
        trim: true,
        minlength: 1,
        unique: true, // mongodb makes sure that every email is unique
        validate: {
            validator: validator.isEmail,
            message: '{VALUE} is not a valid email'
        }
    },
    password: {
        type: String,
        required: true,
        minlength: 6
    },
    tokens: [{
        access: {
            type: String,
            required: true
        },
        token: {
            type: String,
            required: true
        }
    }]
});

module.exports = {User};