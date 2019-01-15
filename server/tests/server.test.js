const expect = require('expect');
const request = require('supertest');

const {app} = require('./../server');
const {Todo} = require('./../models/todo');

// prepare database, so for every new test session it has the same data!

const dummyTodos = [
    { text: "First test todo" },
    { text: "Second test todo" },
    { text: "Third test todo" }
]

beforeEach((done) => {
    // First clear entire Todos collection
    Todo.remove({})
    // Then insert dummy collection
    .then(() => {
        return Todo.insertMany(dummyTodos);
    })
    // Then we are done
    .then(() => done());
});

describe('POST /todos', () => {
    it('should create a new todo', (done) => {
        var text = 'Test todo text';

        request(app)
            .post('/todos')
            .send({text})
            .expect(200)
            .expect((res) => {
                expect(res.body.text).toBe(text);
            })
            .end((err, res) => {
                if (err) {
                    return done(err);
                }

                // Verify that the doc was inserted into db
                Todo.find({text}).then((todos) => {
                    expect(todos.length).toBe(1);
                    expect(todos[0].text).toBe(text);
                    done();
                }).catch((err) => done(err));
            });
    });

    it('should not create todo with invalid body data', (done) => {
        request(app)
            .post('/todos')
            .send({})
            .expect(400)
            .end((err, res) => {
                if (err) return done(err);

                // Verify that no doc was inserted to db
                Todo.find().then((todos) => {
                    expect(todos.length).toBe(dummyTodos.length);
                    done()
                }).catch((err) => done(err));
            })
    });
});

describe('GET /todos', () => {
    it('should get all todos', (done) => {
        request(app)
            .get('/todos')
            .expect(200)
            .expect((res) => {
                expect(res.body.todos.length).toBe(dummyTodos.length);
            })
            .end(done);
    });
});
