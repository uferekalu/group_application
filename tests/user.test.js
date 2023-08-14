const chai = require('chai');
const { expect } = chai;
const chaiHttp = require('chai-http')
const { sequelize, models } = require('./setup')
const bcrypt = require('bcrypt')
const { equal } = require('joi')

// import the User model
const User = models.User

// Enable HTTP assertions with Chai
chai.use(chaiHttp)

describe('User API', () => {
    // Run this before each test
    beforeEach(function () {
        this.timeout(5000);

        // Clear the User table before each test
        return sequelize.query('SET FOREIGN_KEY_CHECKS = 0', { raw: true })
            .then(() => User.destroy({ truncate: true }))
            .then(() => sequelize.query('SET FOREIGN_KEY_CHECKS = 1', { raw: true }));
    });

    it("should create a new user with hashed password", async () => {
        const newUser = {
            name: 'John Doe',
            email: 'john@example.com',
            username: 'lushak',
            password: 'password123',
            country: 'Nigeria',
            sex: 'Male',
            hobbies: 'football'
        }

        // Hash the password
        const hashedPassword = await bcrypt.hash(newUser.password, 10)

        // Make a POST request to create a user
        const res = await chai.request('http://localhost:6000')
            .post('/api/users/register')
            .send({ ...newUser, password: hashedPassword })

        expect(res).to.have.status(201)
        expect(res.body).to.have.property('id')
        expect(res.body.name).to.equal(newUser.name)
        expect(res.body.email).to.equal(newUser.email)
        expect(res.body.username).to.equal(newUser.username)
        expect(res.body.country).to.equal(newUser.country)
        expect(res.body.sex).to.equal(newUser.sex)
        expect(res.body.hobbies).to.equal(newUser.hobbies)

        // Check if user was saved in the database
        const user = await User.fin({ where: { id: res.body.id } })
        expect(user).to.exist
        expect(user.name).to.equal(newUser.name)
        expect(user.email).to.equal(newUser.email)
        expect(user.username).to.equal(newUser.username)
        expect(user.country).to.equal(newUser.country)
        expect(user.sex).to.equal(newUser.sex)
        expect(user.hobbies).to.equal(newUser.hobbies)

        // Verify the hashed password
        const isPasswordValid = await bcrypt.compare(newUser.password, user.password)
        expect(isPasswordValid).to.be.true
    })

    it('should return an error when name is invalid', async () => {
        const newUser = {
            name: 'jo',
            email: 'john@example.com',
            username: 'lushak',
            password: 'password123',
            country: 'Nigeria',
            sex: 'Male',
            hobbies: 'football'
        }

        // Make a POST request to create a user
        const res = await chai.request('http://localhost:6000')
            .post('/api/users/register')
            .send(newUser)

        expect(res).to.have.status(400)
        expect(res.body).to.have.property('error')

        // Check if the error message includes specific validation error messages
        expect(res.body.error).to.contain(`"name" length must be at least 3 characters long`)
    })

    it('should return an error when username is invalid', async () => {
        const newUser = {
            name: 'john Doe',
            email: 'john@example.com',
            username: 'lu',
            password: 'password123',
            country: 'Nigeria',
            sex: 'Male',
            hobbies: 'football'
        }

        // Make a POST request to create a user
        const res = await chai.request('http://localhost:6000')
            .post('/api/users/register')
            .send(newUser)

        expect(res).to.have.status(400)
        expect(res.body).to.have.property('error')

        // Check if the error message includes specific validation error messages
        expect(res.body.error).to.contain(`"username" length must be at least 3 characters long`)
    })

    it('should return an error when password is invalid', async () => {
        const newUser = {
            name: 'john Doe',
            email: 'john@example.com',
            username: 'lushak',
            password: 'pa',
            country: 'Nigeria',
            sex: 'Male',
            hobbies: 'football'
        }

        // Make a POST request to create a user
        const res = await chai.request('http://localhost:6000')
            .post('/api/users/register')
            .send(newUser)

        expect(res).to.have.status(400)
        expect(res.body).to.have.property('error')

        // Check if the error message includes specific validation error messages
        expect(res.body.error).to.contain('"password" length must be at least 6 characters long')
    })

    it('should return an error when email already exists', async () => {
        const existingUser = {
            name: 'John Luke',
            email: 'john@example.com',
            username: 'lushak',
            password: 'password123',
            country: 'Nigeria',
            sex: 'Male',
            hobbies: 'football'
        }

        // Create an existing user in the database
        await User.create(existingUser)

        // Attempt to create a new user with the same email
        const newUser = {
            name: 'John Clement',
            email: 'john@example.com',
            username: 'lushak',
            password: 'password123',
            country: 'Nigeria',
            sex: 'Male',
            hobbies: 'football'
        }

        // Make a POST request to create a user
        const res = await chai.request('http://localhost:6000')
            .post('/api/users/register')
            .send(newUser)

        expect(res).to.have.status(409)
        expect(res.body).to.have.property('error')
        expect(res.body.error).to.equal('Email already exists')
    })

    it('should return an error when username already exists', async () => {
        const existingUser = {
            name: 'John Luke',
            email: 'john@example.com',
            username: 'lushak',
            password: 'password123',
            country: 'Nigeria',
            sex: 'Male',
            hobbies: 'football'
        }

        // Create an existing user in the database
        await User.create(existingUser)

        // Attempt to create a new user with the same username
        const newUser = {
            name: 'John Clement',
            email: 'john@example.com',
            username: 'lushak',
            password: 'password123',
            country: 'Nigeria',
            sex: 'Male',
            hobbies: 'football'
        }

        // Make a POST request to create a user
        const res = await chai.request('http://localhost:6000')
            .post('/api/users/register')
            .send(newUser)

        expect(res).to.have.status(409)
        expect(res.body).to.have.property('error')
        expect(res.body.error).to.equal(`${newUser.username} is already taken`)
    })
})