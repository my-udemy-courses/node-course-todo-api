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

app.post('/todos', authenticate, async (req, res) => {
    var todo = new Todo({
        text: req.body.text,
        _creator: req.user._id
    });

    try{
        const doc = await todo.save();
        res.send(doc);
    } catch(e){
        res.status(400).send(e);
    }
});

app.get('/todos', authenticate, async (req, res) => {
    try{
        const todos = await Todo.find({_creator: req.user._id});
        res.send({todos});
    } catch (e){   
        res.status(400).send(err);
    }
});

app.get('/todos/:id', authenticate, async (req, res) => {
    var id = req.params.id;

    // validate id 
    if (!ObjectID.isValid(id)){
        return res.status(404)
            .send({
                error: `Invalid ObjectID: ${id}`
            });
    }
    
    try{
        const todo = await Todo.findOne({
            _id: id,
            _creator: req.user._id
        });
        
        if (todo){
            res.send({todo});
        } else {
            res.status(404).send();
        }
    } catch(e){   
        res.status(400)
        .send({
            error: err
        });
    }

});

app.delete('/todos/:id', authenticate, async (req, res) => {
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

    try{
        const todo = await Todo.findOneAndRemove({
            _id: id,
            _creator: req.user._id
        });
        if (todo){
            res.send({todo});
        } else {
            res.status(404).send({error: `Todo with ID: ${id} not found.`});
        }
    } catch (e){   
        res.status(400)
        .send({
            error: err
        });
    }
});

app.patch('/todos/:id', authenticate, async (req, res) => {
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

    try{
        var todo = await Todo.findOneAndUpdate({
            _id: id,
            _creator: req.user._id
        }, 
        {$set: body}, {new: true});
        if (!todo){
            return res.status(404).send();
        }
        res.send({todo});

    } catch (e) {
        res.status(400).send();
    }
}); 


app.post('/users', async (req, res) => {
    try{
        const userBody = _.pick(req.body, ['email', 'password']);
        var user = new User(userBody);
        await user.save();
        const token = await user.generateAuthToken();
        res.header('x-auth', token).send({user});
    } catch(e){
        res.status(400).send(e);
    }

});

app.post('/users/login', async (req, res) => {
    try{
        const body = _.pick(req.body, ['email', 'password']);
        const user = await User.findByCredentials(body.email, body.password);
        const token = await user.generateAuthToken();
        res.header('x-auth', token).send({user});
    } catch (e){
        res.status(400).send();
    }
}); 

app.get('/users/me', authenticate, (req, res) => {
    res.send(req.user);
});

app.delete('/users/me/token', authenticate, async (req, res) => {
    try{
        await req.user.removeToken(req.token);
        res.status(200).send();
    } catch(e) {
        res.status(400).send();
    }
});

// start the server
app.listen(port, () => {
    console.log(`Started on port ${port}`);
});

module.exports = {app};