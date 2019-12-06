const express = require("express");
const app = express();
const morgan = require('morgan');
const bodyParser = require('body-parser');
const mongoose = require('mongoose');

const profileRoutes = require('./api/routes/profile');
const jobRoutes = require('./api/routes/jobs');
// const productRoutes = require('./api/routes/products');
// const orderRoutes = require('./api/routes/orders');
const userRoutes = require('./api/routes/users');

mongoose.connect(
    'mongodb+srv://apps:' +
    process.env.MONGO_ATLAS_PW +
    '@node-practise-avqsi.mongodb.net/', {
        dbName: 'testdb1'
    }
);

//mongoose.connect('mongodb://mongodb0.example.com:27017/admin');
//mongoose.connect('mongodb://localhost:27017/admin');
// const MongoClient = require('mongodb').MongoClient
// const myurl = 'mongodb://localhost:27017';

// MongoClient.connect(myurl, (err, client) => {
//   if (err) return console.log(err)
//   db = client.db('test') 
//   app.listen(3000, () => {
//     console.log('listening on 3000')
//   })
// })


//mongoose.Promise = global.Promise;
app.use(morgan('dev'));

app.use('/uploads', express.static('uploads'));

app.use(bodyParser.urlencoded({
    extended: false
}));
app.use(bodyParser.json());

app.use((req, res, next) => {
    res.header('Access-Control-Allow-Origin', '*');
    res.header('Access-Control-Allow-Headers',
        'Origin,X-Requested-With,Content-Type,Accept,Authorization');
    if (req.method === 'options') {
        res.header('Access-Control-Allow-Methods', 'PUT,POST,GET,PATCH,DELETE');
        return res.status(200).json({});
    }
    next();
});

//routes which handle the requests 
// app.use('/products',productRoutes);
// app.use('/orders',orderRoutes);
app.use('/user', userRoutes);
app.use('/jobs', jobRoutes);
app.use('/profile', profileRoutes);


app.use((req, res, next) => {
    const error = new Error('Not Found');
    error.status = 404;
    next(error);
});

app.use((error, req, res, next) => {
    res.status(error.status || 500);
    res.json({
        error: {
            message: error.message
        }
    });
});



const rateLimit = require('express-rate-limit');
const helmet = require('helmet');
const mongoSanitize = require('express-mongo-sanitize');
const xss = require('xss-clean');
// Helmet
app.use(helmet());
// Rate Limiting
const limit = rateLimit({
    max: 100, // max requests
    windowMs: 60 * 60 * 1000, // 1 Hour of 'ban' / lockout 
    message: 'Too many requests' // message to send
});
app.use('/routeName', limit); // Setting limiter on specific route
// Body Parser
app.use(express.json({
    limit: '10kb'
})); // Body limit is 10
// Data Sanitization against NoSQL Injection Attacks
app.use(mongoSanitize());
// Data Sanitization against XSS attacks
app.use(xss())

module.exports = app;