const {ObjectID} = require('mongodb');
const jwt = require('jsonwebtoken');

const {Todo} = require('../../models/todo');
const {User} = require('../../models/user');

// prepare aka seed the database, so for every new test session it has the same data!
const userOneId = new ObjectID();
const userTwoId = new ObjectID();
const dummyUsers = [
    { // first is valid with a token
        _id: userOneId,
        email: 'arthur@example.com',
        password: 'userOnePass',
        tokens: [{
            access: 'auth',
            token: jwt.sign({_id: userOneId, access: 'auth'}, process.env.JWT_SECRET).toString()
        }]
    },{ 
        _id: userTwoId,
        email: 'jutta@example.com',
        password: 'userTwoPass',
        tokens: [{
            access: 'auth',
            token: jwt.sign({_id: userTwoId, access: 'auth'}, process.env.JWT_SECRET).toString()
        }]
    }
];

const dummyTodos = [
    { 
        _id : new ObjectID(),
        text: "First test todo",
        _creator: userOneId
    },
    { 
        _id : new ObjectID(),
        text: "Second test todo",
        completed: true,
        completedAt: 333,
        _creator: userTwoId
    },
    { 
        _id : new ObjectID(),
        text: "Third test todo",
        _creator: userTwoId
    }
];

const populateTodos = (done) => {
    // First clear entire Todos collection
    Todo.remove({})
    // Then insert dummy collection
    .then(() => {
        return Todo.insertMany(dummyTodos);
    })
    // Then we are done
    .then(() => done());
};


const populateUsers = (done) => {
    User.remove({}).then(() => {
        var userOne = new User(dummyUsers[0]).save();
        var userTwo = new User(dummyUsers[1]).save();

        return Promise.all([userOne, userTwo]);
    }).then(() => done());
};

module.exports = { dummyTodos, populateTodos, dummyUsers, populateUsers };