var {User} = require('../models/user');

// define a middleware function. Means it runs After the request comes in and Before the request is delegated to our defined route handlers
var authenticate = (req, res, next) => {
    var token = req.header('x-auth');

    User.findByToken(token)
    .then((user) => {
        if (!user) {
            return Promise.reject();
        }

        req.user = user;
        req.token = token;
        next(); // now proceed to routing methods 
    })
    .catch((e) => {
        res.status(401).send();
    });
};

module.exports = {authenticate};