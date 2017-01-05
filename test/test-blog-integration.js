const chai = require('chai');
const chaiHttp = require('chai-http');
const faker = require('faker');
const mongoose = require('mongoose');

// enforces ES6-style promises for mongoose
mongoose.Promise = global.Promise;

// enables our THING.should.have/THING.should.be-style constructs
const should = chai.should();

const {BlogPost} = require('../models');
const BlogRecords = BlogPost;
// /\ didn't want to alter model.js, but this is semantically clearer, to me

const {app, runServer, closeServer} = require('../server');
const {TEST_DATABASE_URL} = require('../config');

chai.use(chaiHttp);


// populates our database with blog-post-y fake data. Faker does all the work
function seedBlogData() {
    console.info('seeding blog post data');
    const seedData = [];
    for (let i=0; i < 10; i++) {
        seedData.push(generateBlogPostData());
    }
    return BlogRecords.insertMany(seedData);
}
// generates a single plausible-seeming entry of blog-post data
function generateBlogPostData() {
    return {
        author: {
            firstName: faker.name.firstName(),
            lastName: faker.name.lastName()
        },
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

describe('Blog posts API resource', function() {

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
            let res;
            return chai.request(app)
                .get('/posts')
                .then(function(_res) {
                    res = _res;
                    res.should.have.status(200);
                    return BlogRecords.count();
                })
                .then(function(count) {
                    res.body.should.have.length.of(count);
                });
        });

        it('should return records with the right fields', function() {
            let resSingleBlogPost;
            return chai.request(app)
                .get('/posts')
                .then(function(res) {
                    res.should.have.status(200);
                    res.should.be.json;
                    res.body.should.be.a('array');
                    res.body.should.have.length.of.at.least(1);

                    res.body.forEach(function(blogPost) {
                        blogPost.should.be.a('object');
                        blogPost.should.include.keys(
                            'title', 'author', 'content');
                    });
                    resSingleBlogPost = res.body[0];
                    return BlogRecords.findById(resSingleBlogPost.id);
                })
                .then(function(blogPost) {
                    resSingleBlogPost.id.should.equal(blogPost.id);
                    resSingleBlogPost.title.should.equal(blogPost.title);
                    resSingleBlogPost.author.should.equal(blogPost.authorName);
                    resSingleBlogPost.content.should.equal(blogPost.content);
                });

        });

        // it('should return specific blog posts if given an _id as a path ', function() {
        //     let resSingleBlogPost;
        //     return chai.request(app)
        //         .get('/posts')
        //         .then(function(res) {
        //             resSingleBlogPost = res.body[0];
        //             return;
        //         })
        //         .get(`/posts/${resSingleBlogPost.id}`);
        // });
    });

    describe('POST endpoint', function() {
        it('should add a new blog post', function() {
            const newPost = generateBlogPostData(); // newly generated blog post data

            return chai.request(app)
                .post('/posts')
                .send(newPost)
                .then(function(res) {
                    // compare our response to the example object we created
                    res.should.have.status(201);
                    res.should.be.json;
                    res.body.should.include.keys(
                        'title', 'author', 'content');
                    res.body.title.should.equal(newPost.title);
                    res.body.author.should.equal(`${newPost.author.firstName} `
                                                +`${newPost.author.lastName}`);
                    res.body.content.should.equal(newPost.content);
                    return BlogRecords.findById(res.body.id);
                })
                .then(function(blogRecord) {
                    //compare our actual database instance (blogRecord) to the example object we created
                    blogRecord.title.should.equal(newPost.title);
                    blogRecord.author.firstName.should.equal(newPost.author.firstName);
                    blogRecord.author.lastName.should.equal(newPost.author.lastName);
                    blogRecord.content.should.equal(newPost.content);
                });

        });
    });

    // describe('PUT endpoint', function() {
    //     it('should update the fields of our blog post data that we specify', function() {
    //         ;
    //     });
    // });

    // describe('DELETE endpoint', function() {
    //     it('should delete a post by id', function() {
    //         ;
    //     });

});
