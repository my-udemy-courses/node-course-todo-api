// const MongoClient = require('mongodb').MongoClient;
// object destructuring (es6 syntax).
const {MongoClient, ObjectID} = require('mongodb');

// var obj = new ObjectID();
// console.log(obj);

MongoClient.connect('mongodb://localhost:27017/TodoApp', (err, db) => {
    if (err) {
        return console.log('Unable to connect to MongoDB server');
    }
    console.log('Connected to MongoDB server');

    db.collection('Todos').findOneAndUpdate({
        _id: new ObjectID("5c36325e58da619a913062c8")
    }, {
        $set: {
            completed: false
        }
    }, {
        returnOriginal: false
    }).then((result) => {
        console.log(result);
    });

    // find User and update name and increase age
    db.collection('Users').findOneAndUpdate({
        _id: new ObjectID("5c34d2d26e57421898c86200")
    }, {
        $set: {
            name: 'Arthur'
        },
        $inc: {
            age: 1
        }
    }, {
        returnOriginal: false
    }).then((result) => {
        console.log(result);
    })

    db.close();
});