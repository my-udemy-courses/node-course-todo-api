const _ = require('lodash');
const express = require('express');
const bodyParser = require('body-parser');
const {ObjectID} = require('mongodb');

var {mongoose} = require('./db/mongoose');
var {Todo} = require('./models/todo');
var {User} = require('./models/user');

var app = express();
const port = process.env.PORT || 3000;

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
})

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

// start the server
app.listen(port, () => {
    console.log(`Started on port ${port}`);
});

module.exports = {app};