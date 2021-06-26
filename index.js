const express = require('express');
const app = express();
const bodyParser = require('body-parser');
const cors = require('cors');
const fileUpload = require('express-fileupload');
const port = 5000;
const MongoClient = require('mongodb').MongoClient;
const ObjectId = require('mongodb').ObjectId;

app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: false }));
app.use(cors());
app.use(fileUpload());

require('dotenv').config();

app.get('/', (req, res) => {
    res.send('Hello Buddy');
})

const uri = `mongodb+srv://${process.env.DB_USER}:${process.env.DB_PASS}@cluster0.wzcd4.mongodb.net/${process.env.DB_NAME}?retryWrites=true&w=majority`;
const client = new MongoClient(uri, { useNewUrlParser: true, useUnifiedTopology: true });

client.connect(err => {
    const postsCollection = client.db("blogPost").collection("posts");
    const adminsCollection = client.db("blogPost").collection("admins");

    // add post
    app.post('/addPost', (req, res) => {
        const file = req.files.file;
        const title = req.body.title;
        const blogContent = req.body.blogContent;
        const postDate = req.body.postDate;

        const newImg = file.data;
        const encImg = newImg.toString('base64');

        let coverImage = {
            contentType: file.mimetype,
            size: file.size,
            img: Buffer.from(encImg, 'base64')
        };

        postsCollection.insertOne({ title, blogContent, postDate, coverImage })
            .then(result => {
                res.send(result.insertedCount > 0);
            })
    })

    // all post list
    app.get('/postList', (req, res) => {
        postsCollection.find({})
            .toArray((err, documents) => {
                res.send(documents);
            });
    });

    // single post
    app.get('/singleBlogPost/:id', (req, res) => {
        postsCollection.find({ _id: ObjectId(req.params.id) })
            .toArray((err, document) => {
                res.send(document[0]);
            })
    })

    // delete post 
    app.delete('/deleteBlogPost/:id', (req, res) => {
        postsCollection.deleteOne({ _id: ObjectId(req.params.id) })
            .then(result => {
                res.send(result.deletedCount > 0);
            })
    })

    // admin detail
    app.get('/adminDetails', (req, res) => {
        adminsCollection.find({})
            .toArray((err, documents) => {
                res.send(documents);
            });
    });

});

app.listen(process.env.PORT || port);