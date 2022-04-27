const request = require('supertest')
const app = require('../app')
const mongoose = require("mongoose");
const User = require('../models/User');

const userOne = {
    name: 'Huy',
    email: 'Huy.ngo@ttu.edu',
    password: 'abcd1234'
}
const userTwo = {
    name: 'Om',
    email: 'Om.kannamwar@ttu.edu',
    password: 'abcd1234'
}
beforeAll(async(done) => {
    await User.deleteMany();
    await request(app).post('/api/users').send({
        name: userTwo.name,
        email: userTwo.email,
        password: userTwo.password
    })
    done()
}
)
  
afterAll(done => {
    // Closing the DB connection allows Jest to exit successfully.
    mongoose.connection.close()
    done()
  })

// @route Post api/users
// @desc create a new user
test("should sign up a new user", async () => {
    await request(app).post('/api/users').send({
        name: userOne.name,
        email: userOne.email,
        password: userOne.password
    }).expect(200)
})

// @route Post api/users
// @desc sign up with an existed email
test("should not sign up with duplicated email", async () => {
    await request(app).post('/api/users').send({
        name: userTwo.name,
        email: userTwo.email,
        password: userTwo.password
    }).expect(400)
})

// @route Post api/auth
// @desc login to existed account
test("should login to the existing user", async() => {
    await request(app).post('/api/auth').send({
        email: userOne.email,
        password: userOne.password
    }).expect(200)
})

// @route Post api/auth
// @desc login to non-existed account
test("should not login to the nonexisting user", async() => {
    await request(app).post('/api/auth').send({
        email: "fakeEmail@ttu.edu",
        password: "1234"
    }).expect(400)
})

// @route Post api/auth
// @desc login with wrong format email
test("should not login with wrong format email", async() => {
    await request(app).post('/api/auth').send({
        email: "fake Email",
        password: "1234"
    }).expect(422)
})

// @route Post api/auth
// @desc login with wrong password
test("should not login with wrong password", async() => {
    await request(app).post('/api/auth').send({
        email: userOne.email,
        password: "wrong password"
    }).expect(400)
})