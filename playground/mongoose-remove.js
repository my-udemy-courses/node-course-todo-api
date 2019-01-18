const {ObjectID} = require('mongodb');

const {mongoose} = require('../server/db/mongoose');
const {Todo} = require('./../server/models/todo');
const {User} = require('./../server/models/user');

// Todo.remove({}).then((result) => {
//     console.log(result);
// });

// Todo.findOneAndRemove
// Todo.findByIdAndRemove

Todo.findOneAndRemove({_id: '5c3f5c110753190d1473d0b4'}).then((todo) => {

});

Todo.findByIdAndRemove('5c3f5c110753190d1473d0b4').then((todo) => {
    console.log(todo);
});