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

    // deleteMany
    // db.collection('Todos').deleteMany({text: 'eat lunch'}).then((result) => {
    //     console.log(result);
    // });

    // deleteOne
    // db.collection('Todos').deleteOne({text: 'eat lunch'}).then((result) => {
    //     console.log(result);
    // });

    // findOneAndDelete
    // db.collection('Todos').findOneAndDelete({completed: false}).then((result) => {
    //     console.log(result);
    // });

    // delete duplicate Arthurs so that only one Arthur exists in db.
    db.collection('Users').find({ name: 'Artdhur' }).toArray()
    .then((docs) => {
        console.log(`Found ${docs.length} Users with name Arthur.`);
        for(var i = 1; i < docs.length; i++){
            db.collection('Users').findOneAndDelete({_id: new ObjectID(docs[i]._id)})
            .then((result) => {
                console.log(`Deleted ${result}.`);
            }, (err) => {
                console.log(`Unable to delete user`);
            });
        }
    }, (err) => {
        console.log('Unable to find documents.', err);
    });


    // db.close();
});