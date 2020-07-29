const express = require("express");
const compression = require('compression');
const app = express();
const cors = require('cors');
const morgan = require('morgan');
const bodyParser = require('body-parser');
const mongoose = require('mongoose');
var crypto = require('crypto');
const profileRoutes = require('./api/routes/profile');
const jobRoutes = require('./api/routes/jobs');
const userRoutes = require('./api/routes/users');
const process = require('process');
const User = require('./api/models/users');
const paymentRoutes = require('./api/routes/payment')
const organisationRoutes = require('./api/routes/organisation');
const missingFeatureRoutes = require('./api/features/missingFeatures');
app.use(cors()); // Using Cors policy for CROSS ORIGIN CALLS
app.options('*', cors())
app.use(compression()); // Compressing responses to reduce data transfer to clients

let mongoOptions={
    autoIndex: false, // Don't build indexes
    poolSize: 10, // Maintain up to 10 socket connections
}

console.log("DB_URL",process.env.DB_URL);

mongoose.connect(process.env.DB_URL,mongoOptions);

app.use(morgan('dev'));

app.use('/uploads', express.static('uploads'));
app.use(express.static(__dirname + '/'));
app.engine('html', require('ejs').renderFile);
app.set('view engine', 'html');
app.set('views', __dirname);

app.get('/', function(req,res) {    
    res.send({
        message:'Welcome'
    })
});
    

app.post('/', function(req, res){
    res.send({
        message:'Welcome'
    })
});
app.use(bodyParser.urlencoded({
    extended: true
}));
app.use(bodyParser.json());

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

app.use('/user', userRoutes.routes);
app.use('/jobs', jobRoutes.routes);
app.use('/profile', profileRoutes.routes);
app.use('',paymentRoutes.routes);
app.use('/organisation',organisationRoutes.routes);
app.use('/missingFeatures',missingFeatureRoutes.routes);

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
app.use('/user/login', limit); // Setting limiter on specific route
// Body Parser
app.use(express.json({
    limit: '30kb'
})); // Body limit is 10
// Data Sanitization against NoSQL Injection Attacks
app.use(mongoSanitize());
// Data Sanitization against XSS attacks
app.use(xss())

module.exports = app;
