const mongoose = require('mongoose');
const validator = require('validator');
const jwt = require('jsonwebtoken');
const _ = require('lodash');

var UserSchema = new mongoose.Schema({
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

UserSchema.methods.toJSON = function () {
    var user = this;
    var userObject = user.toObject();

    return _.pick(userObject, ['_id', 'email']);
};

// add new method 'genereateAuthToken' to mongoose schema object
UserSchema.methods.generateAuthToken = function () {
    // we have to use regular function () syntax to be able to reference the "this" keyword. Arrow-functions () => dont bind the "this" keyword so its more difficult to get the instance
    var user = this;
    var access = 'auth';
    // generate token for user
    var token = jwt.sign({ // first param object is the payload, which can be read by everyone
        _id: user._id.toHexString(), 
        access
    }, 'abc123') // last parameter is our secret aka salt.
    .toString();

    // add the token to the user instance
    user.tokens.concat([{access, token}]);

    return user.save().then(() => {
        return token;
    });
};

var User = mongoose.model('User', UserSchema);

module.exports = {User};