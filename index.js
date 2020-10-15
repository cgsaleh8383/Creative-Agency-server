const express = require('express');
const bodyParser = require('body-parser');
const cors = require('cors');
const fs = require('fs-extra');
const fileUpload = require('express-fileupload');
const MongoClient = require('mongodb').MongoClient;
require('dotenv').config()


const uri = `mongodb+srv://${process.env.DB_USER}:${process.env.DB_PASS}@cluster0.lvtch.mongodb.net/${process.env.DB_NAME}?retryWrites=true&w=majority`;

const app = express()

app.use(bodyParser.json());
app.use(cors());
app.use(express.static('creative'));
app.use(fileUpload())

const port = 5000;

app.get('/', (req, res) => {
    res.send("hello from db it's working working")
})

const client = new MongoClient(uri, { useNewUrlParser: true, useUnifiedTopology: true });
client.connect(err => {
    const creativityCollection = client.db("creativeAgency").collection("orders");
    const reviewCollection = client.db("creativeAgency").collection("review");
    const serviceCollection = client.db("creativeAgency").collection("services");


    // ==================================================== Admin services

    app.post('/addServices', (req, res) => {
        const file = req.files.file;
        const email = req.body.email;
        const service = req.body.service;
        const project = req.body.project;

        console.log(file, email, service, project);
        const newImg = file.data;
        const encImg = newImg.toString('base64');

        const image = {
            contentType: req.files.file.mimetype,
            size: req.files.file.size,
            img: Buffer.from(encImg, 'base64')
        };

        serviceCollection.insertOne({  email, service, project, image })
            .then(result => {
                res.send(result.insertedCount > 0);
            })
    })

    app.get('/services', (req, res) => {
        serviceCollection.find({})
            .toArray((err, documents) => {
                res.send(documents);
            })
    });

    app.post('/admin', (req, res) => {
        const email = req.body.email;
        serviceCollection.find({ email: email })
            .toArray((err, admins) => {
                res.send(admins.length > 0);
            })
    })

    // ==================================================== Admin services






    // ==================================================== Client review

    app.post('/review', (req, res) => {
        const file = req.files.file;
        const name = req.body.name;
        const email = req.body.email;
        const description = req.body.description;
        const designation = req.body.designation;

        console.log(file, name, email, description, designation);
        const newImg = file.data;
        const encImg = newImg.toString('base64');

        const image = {
            contentType: req.files.file.mimetype,
            size: req.files.file.size,
            img: Buffer.from(encImg, 'base64')
        };

        reviewCollection.insertOne({ name, email, description, designation, image })
            .then(result => {
                res.send(result.insertedCount > 0);
            })
    })



    app.get('/reviews', (req, res) => {
        reviewCollection.find({})
            .toArray((err, documents) => {
                res.send(documents);
            })
    });


    // ==================================================== Client order

    app.post('/order', (req, res) => {
        const file = req.files.file;
        const name = req.body.name;
        const email = req.body.email;
        const project = req.body.project;
        const service = req.body.service;

        console.log(file, name, email, project, service);
        const newImg = file.data;
        const encImg = newImg.toString('base64');

        const image = {
            contentType: req.files.file.mimetype,
            size: req.files.file.size,
            img: Buffer.from(encImg, 'base64')
        };

        creativityCollection.insertOne({ name, email, project, service, image })
            .then(result => {
                res.send(result.insertedCount > 0);
            })
    })



    app.get('/orders', (req, res) => {
        creativityCollection.find({})
            .toArray((err, documents) => {
                res.send(documents);
            })
    });


});


app.listen(process.env.PORT || port)