const { json } = require('express');
const request = require('supertest');
const app = require('../src/app');
const User = require('../src/models/user');

const userTest = {
    name: 'TEST',
    email: 'email@test.pl',
    password: '1q2w3e4r',
};

//
beforeEach(async () => {
    await User.deleteMany();
    await new User(userTest).save();
});
afterEach(() => console.log('after each'));

test('Should signup a new user', async () => {
    await request(app)
        .post('/users')
        .send({
            name: 'Kacper',
            email: 'kapisoflec@gmail.com',
            password: 'haslowdupietrzaslo',
        })
        .expect(200);
});

test('Should login existing user', async () => {
    await request(app)
        .post('/users/login')
        .send({
            email: userTest.email,
            password: userTest.password,
        })
        .expect(200);
});

test('Should not login existing user', async () => {
    await request(app)
        .post('/users/login')
        .send({
            email: 'notexistinguser@mail.com',
            password: 'fakepass12321',
        })
        .expect(400);
});
