const request = require('supertest')
const jwt = require('jsonwebtoken')
const app = require('../app')
const config = require("config");
const mongoose = require("mongoose");
const User = require('../models/User');
const Profile = require('../models/Profile');
const bcrypt = require('bcryptjs');
const userOneId = new mongoose.Types.ObjectId()

let tokenUser = '';

const userOne = {
    name: 'Huy',
    email: 'Huy.ngo@gmail.edu',
    password: 'abcd1234',
    decryptedPassowrd: 'abcd1234'
}


beforeAll(async(done) => {
    

    await Profile.deleteMany();
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

// @route Post api/profile
// @desc create personal profile
test("should create personal profile", async() => {
    await request(app).
        post('/api/profile').
        set("x-auth-token", `${tokenUser}`).
        send(
            {
                Company: "Texas Tech University",
                status: "student",
                webtsite: "https://www.ttu.edu/",
                skills: "SQL, NOSQL, C++, SCRUM",
                Location: "Lubbock, Texas",
                youtube: "https://www.youtube.com/user/texastech"
            }
        ).
        expect(200)
})

// @route update api/profile/experience
// @desc update work experience
test("should update work experience", async() => {
    await request(app).
        put('/api/profile/experience').
        set("x-auth-token", `${tokenUser}`).
        send(
            {
                title: " Student ", 
                location: "Lubbock",
                company: "Texas Tech University",
                from: "2021-02-23"
            }
        ).
        expect(200)
})

// @route Get api/profile/me
// @desc get the personal profile
test("should get personal profile", async() => {
    await request(app).
        get('/api/profile/me').
        set("x-auth-token", `${tokenUser}`).
        send().expect(200)
})
