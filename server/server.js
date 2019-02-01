require('./config/config.js');

const _ = require('lodash');
const express = require('express');
const bodyParser = require('body-parser');
const {ObjectID} = require('mongodb');

var {mongoose} = require('./db/mongoose');
var {Todo} = require('./models/todo');
var {User} = require('./models/user');
var {authenticate} = require('./middleware/authenticate');

var app = express();
const port = process.env.PORT;

// middleware hooks into the http communication and parses the response.body to an object
app.use(bodyParser.json());

app.post('/todos', (req, res) => {
    var todo = new Todo({
        text: req.body.text
    });
    todo.save().then((doc) => {
        res.send(doc);
    }, (e) => {
        res.status(400).send(e);
    });
});

app.get('/todos', (req, res) => {
    Todo.find().then((todos) => {
        res.send({todos});
    })
    .catch((err) => {
        res.status(400).send(err);
    });
});

app.get('/todos/:id', (req, res) => {
    var id = req.params.id;

    // validate id 
    if (!ObjectID.isValid(id)){
        return res
            .status(404)
            .send({
                error: `Invalid ObjectID: ${id}`
            });
    }
    
    Todo.findById(id).then((todo) => {
        if (todo){
            res.send({todo});
        } else {
            res.status(404).send();
        }
    }).catch((err) => {
        res.status(400)
        .send({
            error: err
        });
    });
});

app.delete('/todos/:id', (req, res) => {
    // get the id
    var id = req.params.id;

    // validate the id -> not valid? return 404
    if (!ObjectID.isValid(id)){
        return res
            .status(404)
            .send({
                error: `Invalid ObjectID: ${id}`
            });
    }

    // remove todo by id
    Todo.findByIdAndRemove(id).then((todo) => {
        if (todo){
            res.send({todo});
        } else {
            res.status(404).send({error: `Todo with ID: ${id} not found.`});
        }
    }).catch((err) => {
        res.status(400)
        .send({
            error: err
        });
    });
});

app.patch('/todos/:id', (req, res) => {
    var id = req.params.id;
    var body = _.pick(req.body, ['text', 'completed']);

    if (!ObjectID.isValid(id)){
        return res
            .status(404)
            .send({
                error: `Invalid ObjectID: ${id}`
            });
    }

    if (_.isBoolean(body.completed) && body.completed) {
        body.completedAt = new Date().getTime();
    } else {
        body.completed = false;
        body.completedAt = null;
    }

    Todo.findByIdAndUpdate(id, {$set: body}, {new: true})
    .then((todo) => {
        if (!todo){
            return res.status(404).send();
        }

        res.send({todo});
    })
    .catch((err) => {
        res.status(400).send();
    });
}); 

// POST /users
app.post('/users', (req, res) => {
    var userBody = _.pick(req.body, ['email', 'password']);
    var user = new User(userBody);

    user.save().then(() => { // try to save new user object
        // New user was created. 
        // Now generate auth token and save again, then return promise
        return user.generateAuthToken();
    })
    .then((token) => {
        // updating user with token in database was successfull
        res.header('x-auth', token)
            .send({user});
    })
    .catch((err) => {
        res.status(400).send(err);
    });

});

app.get('/users/me', authenticate, (req, res) => {
    res.send(req.user);
});

// start the server
app.listen(port, () => {
    console.log(`Started on port ${port}`);
});

module.exports = {app};