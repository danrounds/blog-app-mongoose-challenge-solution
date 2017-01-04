const chai = require('chai');
const chaiHttp = require('chai-http');
const faker = require('faker');
const mongoose = require('mongoose');

// enforces ES6-style promises for mongoose
mongoose.Promise = global.Promise;

// enables our THING.should.have/THING.should.be-style constructs
const should = chai.should();

const {BlogPost} = require('../models');
const {app, runServer, closeServer} = require('../server');
const {TEST_DATABASE_URL} = require('../config');

chai.use(chaiHttp);

// populates our database with blog-post-y fake data. Faker does all the work
function seedBlogData() {
    const seedData = [];
    for (let i=0; i < 10; i++) {
        seedData.push(generateBlogPostData());
    }
    return BlogPost.insertMany(seedData);
}
// generates a single plausible-seeming entry of blog-post data
function generateBlogPostData() {
    return {
        author: faker.findName(),
        content: faker.lorem.paragraphs(13),
        title: faker.random.words(),
        create: faker.date.past()
    };
}

// deletes the entire database, so we can start anew
function tearDownDb() {
    console.warn('Clearing database');
    return mongoose.connection.dropDatabase();
}

describe('Blog posts API resource'), function() {

    // each of our hook functions returns a callback
    before(function() {
        return runServer(TEST_DATABASE_URL);
    });

    beforeEach(function() {
        return seedBlogData();
    });

    afterEach(function() {
        return tearDownDb();
    });

    after(function() {
        return closeServer();
    });

    // our actual tests. We next `describes', because it makes semantic sense
    describe('GET endpoint', function() {
        it('should return all our blog posts', function() {
            ;
        });
        it('should return records with the right fields', function() {
            ;
        });

        it('should return specific blog posts if given an _id as a path ', function() {
            ;
        });
    });

    describe('POST endpoint', function() {
        it('should add a new blog post', function() {
            ;
        });
    });

    describe('PUT endpoint', function() {
        it('should update the fields of our blog post data that we specify', function() {
            ;
        });
    });

    describe('DELETE endpoint', function() {
        it('should delete a post by id', function() {
            ;
        });
    });

}
