const request = require('supertest')
const jwt = require('jsonwebtoken')
const app = require('../app')
const config = require("config");
const mongoose = require("mongoose");
const User = require('../models/User');
const Post = require('../models/Post');
const bcrypt = require('bcryptjs');
const userOneId = new mongoose.Types.ObjectId()

let tokenUser = '';
let postID = ''
const userOne = {
    name: 'Huy',
    email: 'Huy.ngo@outlook.com',
    password: 'abcd1234',
    decryptedPassowrd: 'abcd1234'
}
const postOne = {
    text: "Hello"
}


beforeAll(async(done) => {
    

    await Post.deleteMany();
    userOne.password = await bcrypt.hash(userOne.decryptedPassowrd, 10);

    user = await new User(userOne).save()
    userOne.id = user._id

    const payload = {
        user: {
          id: userOne.id,
        },
    };
    tokenUser = await jwt.sign(
        payload,
        config.get('jwtSecret'),
        { expiresIn: 360000 }
    );

    post = await new Post(postOne).save()
    postOne.id = post._id
    done()
}
)
  
afterAll(done => {
    // Closing the DB connection allows Jest to exit successfully.
    mongoose.connection.close()
    done()
  })

// @route Post api/auth
// @desc login to existed user
test("should login to the existing user", async() => {
    await request(app).post('/api/auth').send({
        email: userOne.email,
        password: userOne.decryptedPassowrd
    }).expect(200);
})

// @route Post api/posts
// @desc create post
test("should create post", async() => {
    await request(app).
        post('/api/posts').
        set("x-auth-token", `${tokenUser}`).
        send(
            {
                text: "Today weather is so nice!!!"
            }
        ).
        expect(200)
})

// @route Get api/posts
// @desc get the post
test("should get all posts", async() => {
    await request(app).
        get('/api/posts').
        set("x-auth-token", `${tokenUser}`).
        send().expect(200)
})

// @route Get api/posts/:id
// @desc get the post by id
test("should get post by id", async() => {
    await request(app).
        get(`/api/posts/${postOne.id}`).
        set("x-auth-token", `${tokenUser}`).
        send().expect(200)
})




// @route Put api/posts/:id
// @desc like the post by id
test("should like the post by id", async() => {
    await request(app).
        put(`/api/posts/like/${postOne.id}`).
        set("x-auth-token", `${tokenUser}`).
        send().expect(200)
})

// @route Post api/posts/:id
// @desc comment the post by id
test("should comment post by id", async() => {
    await request(app).
        post(`/api/posts/comment/${postOne.id}`).
        set("x-auth-token", `${tokenUser}`).
        send(
            {text: "nice post"}
        ).expect(200)
})
