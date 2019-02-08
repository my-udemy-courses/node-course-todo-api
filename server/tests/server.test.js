const expect = require('expect');
const request = require('supertest');
const { ObjectID } = require('mongodb');

const { app } = require('./../server');
const { Todo } = require('./../models/todo');
const { User } = require('./../models/user');
const { dummyTodos, populateTodos, dummyUsers, populateUsers } = require('./seed/seed');

beforeEach(populateUsers);
beforeEach(populateTodos);

describe('POST /todos', () => {
    it('should create a new todo', (done) => {
        var text = 'Test todo text';

        request(app)
            .post('/todos')
            .send({ text })
            .expect(200)
            .expect((res) => {
                expect(res.body.text).toBe(text);
            })
            .end((err, res) => {
                if (err) {
                    return done(err);
                }

                // Verify that the doc was inserted into db
                Todo.find({ text }).then((todos) => {
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
                    done();
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

describe('GET /todos/:id', () => {
    it('should return todo doc', (done) => {
        request(app)
            .get(`/todos/${dummyTodos[0]._id.toHexString()}`)
            .expect(200)
            .expect((res) => {
                expect(res.body.todo.text).toBe(dummyTodos[0].text);
            })
            .end(done);
    });

    it('should return 404 if todo not found', (done) => {
        var falseID = new ObjectID().toHexString();
        request(app)
            .get(`/todos/${falseID}`)
            .expect(404)
            .end(done);
    });

    it('should return 400 for non-object ids', (done) => {
        var invalidID = "1234asdfb";
        request(app)
            .get(`/todos/${invalidID}`)
            .expect(404)
            .end(done);
    });
});

describe('DELETE /todos/:id', () => {
    it('should remove a todo', (done) => {
        var hexId = dummyTodos[1]._id.toHexString();

        request(app)
            .delete(`/todos/${hexId}`)
            .expect(200)
            .expect((res) => {
                expect(res.body.todo._id).toBe(hexId);
            })
            .end((err, res) => {
                if (err) {
                    return done(err);
                }

                // query databse using findById toNotExist
                Todo.findById(hexId).then((todo) => {
                    expect(todo).toNotExist();
                    done();
                }).catch((err) => done(err));
            })
    });

    it('should return 404 if todo not found', (done) => {
        var falseID = new ObjectID().toHexString();

        request(app)
            .delete(`/todos/${falseID}`)
            .expect(404)
            .end(done);
    });

    it('should return 404 if object id is invalid', (done) => {
        var invalidID = "1234asdfb";

        request(app)
            .delete(`/todos/${invalidID}`)
            .expect(404)
            .end(done);
    });
});

describe('PATCH /todos/:id', () => {
    it('should update the todo', (done) => {
        // grab id of first item
        var id = dummyTodos[0]._id.toHexString();
        // update text, set completed to true
        var updateBody = {
            text: "new body boi!",
            completed: true
        };
        request(app)
            .patch(`/todos/${id}`)
            .send(updateBody)
            .expect(200)
            .expect((res) => {
                expect(res.body.todo.text).toBe(updateBody.text);
                expect(res.body.todo.completed).toBe(true);
                expect(res.body.todo.completedAt).toBeA('number');
            })
            .end(done);

    });

    it('should clear completedAt when todo is not completed', (done) => {
        // grab id of second item
        var id = dummyTodos[1]._id.toHexString();
        // update text, set completed to true
        var updateBody = {
            text: "new body 1234 boi!",
            completed: false
        };
        request(app)
            .patch(`/todos/${id}`)
            .send(updateBody)
            .expect(200)
            .expect((res) => {
                expect(res.body.todo.text).toBe(updateBody.text);
                expect(res.body.todo.completed).toBe(false);
                expect(res.body.todo.completedAt).toNotExist();
            })
            .end(done);
    });
});

describe('GET /users/me', () => {
    it('should return user if authenticated', (done) => {
        request(app)
            .get('/users/me')
            .set('x-auth', dummyUsers[0].tokens[0].token)
            .expect(200)
            .expect((res) => {
                expect(res.body._id).toBe(dummyUsers[0]._id.toHexString());
                expect(res.body.email).toBe(dummyUsers[0].email);
            })
            .end(done);
    });

    it('should return 401 if not authenticated', (done) => {
        request(app)
            .get('/users/me')
            .expect(401)
            .expect((res) => {
                expect(res.body).toEqual({});
            })
            .end(done);
    });
});

describe('POST /users', () => {
    it('should create a user', (done) => {
        var email = 'example@example.com';
        var password = '123mnb!';

        request(app)
            .post('/users')
            .send({email, password})
            .expect(200)
            .expect((res) => {
                expect(res.headers['x-auth']).toExist();
                expect(res.body.user.email).toBe(email);
                expect(res.body.user._id).toExist();
            })
            .end((err) => {
                if (err) return done(err);

                User.findOne({email}).then((user) => {
                    expect(user).toExist();
                    expect(user.password).toNotBe(password);
                    done();
                }).catch((e) => done(e));
            });
    });

    it('should return validation errors if request invalid', (done) => {
        var invalidEmail = '.example@example.com';
        var password = '123mnb!';

        request(app)
            .post('/users')
            .send({email: invalidEmail, password})
            .expect(400)
            .expect((res) => {
                expect(res.headers['x-auth']).toNotExist();
                expect(res.body.user).toNotExist();
            })
            .end(done);
    });

    it('should not create user if email in use', (done) => {
        var password = '123mnb!';

        request(app)
            .post('/users')
            .send({email: dummyUsers[0].email, password})
            .expect(400)
            .expect((res) => {
                expect(res.headers['x-auth']).toNotExist();
                expect(res.body.user).toNotExist();
            })
            .end(done);
    });
});

describe('POST /users/login', () => {
    it('should login user and return auth token', (done) => {
        request(app)
            .post('/users/login')
            .send({
                email: dummyUsers[1].email,
                password: dummyUsers[1].password
            })
            .expect(200)
            .expect((res) => {
                expect(res.headers['x-auth']).toExist();
            })
            .end((err, res) => {
                if (err) {
                    return done(err);
                }

                User.findById(dummyUsers[1]._id).then((user) => {
                    expect(user.tokens[0]).toInclude({
                        access: 'auth',
                        token: res.headers['x-auth']
                    });
                    done();
                }).catch((e) => done(e));
            });
    });
    
    it('should reject invalid login', (done) => {
        request(app)
        .post('/users/login')
        .send({
            email: dummyUsers[1].email,
            password: dummyUsers[1].password + "nah"
        })
        .expect(400)
        .expect((res) => {
            expect(res.headers['x-auth']).toNotExist();
        })
        .end((err, res) => {
            if (err) {
                return done(err);
            }

            User.findById(dummyUsers[1]._id).then((user) => {
                expect(user.tokens.length).toBe(0);
                done();
            }).catch((e) => done(e));
        });
    });

});