const express = require("express");
const app = express();
const cors = require('cors');
const morgan = require('morgan');
const bodyParser = require('body-parser');
const mongoose = require('mongoose');
var crypto = require('crypto');
const profileRoutes = require('./api/routes/profile');
const jobRoutes = require('./api/routes/jobs');
// const productRoutes = require('./api/routes/products');
// const orderRoutes = require('./api/routes/orders');
const userRoutes = require('./api/routes/users');

const User = require('./api/models/users');
// router.all('*', cors());
app.use(cors());


// testdb2 for test and prod for production 

// mongoose.connect(
//     'mongodb+srv://apps:' +
//     process.env.MONGO_ATLAS_PW +
//     '@node-practise-avqsi.mongodb.net/', {
//         dbName: 'testdb1'
//     }
// );

//mongoose.connect('mongodb://mongodb0.example.com:27017/admin');
// mongoose.connect('mongodb://localhost:27017/testdb');
// mongoose.connect('mongodb://localhost:27017/stag');
mongoose.connect('mongodb://localhost:27017/stag?authSource=admin');
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
app.use(express.static(__dirname + '/'));
app.engine('html', require('ejs').renderFile);
app.set('view engine', 'html');
app.set('views', __dirname);

app.get('/', function(req,res) {    
    var ord = JSON.stringify(Math.random()*1000);
    var i = ord.indexOf('.');
    ord = 'ORD'+ ord.substr(0,i);   
    res.render(__dirname + '/checkout.html', {orderid:ord});
    
});
    

app.post('/', function(req, res){
    var strdat = '';
    
    req.on('data', function (chunk) {
        strdat += chunk;
    });
    
    req.on('end', function()
    {
        var data = JSON.parse(strdat);
        var cryp = crypto.createHash('sha512');
        var text = data.key+'|'+data.txnid+'|'+data.amount+'|'+data.pinfo+'|'+data.fname+'|'+data.email+'|||||'+data.udf5+'||||||'+data.salt;
        cryp.update(text);
        var hash = cryp.digest('hex');      
        res.setHeader("Content-Type", "text/json");
        res.setHeader("Access-Control-Allow-Origin", "*");
        res.end(JSON.stringify(hash));      
    });
    
    
});
app.use(bodyParser.urlencoded({
    extended: true
}));
app.use(bodyParser.json());

app.post('/paySuccess', function(req, res){
    // console.log("paysucess"+ req);
    // console.log(req.body);
    var key = req.body.key;
    var salt = req.body.salt;
    var txnid = req.body.txnid;
    var amount = req.body.amount;
    var productinfo = req.body.productinfo;
    var firstname = req.body.firstname;
    var email = req.body.email;
    var udf5 = req.body.udf5;
    var mihpayid = req.body.mihpayid;
    var status = req.body.status;
    var resphash = req.body.hash;
    
    var keyString       =   key+'|'+txnid+'|'+amount+'|'+productinfo+'|'+firstname+'|'+email+'|||||'+udf5+'|||||';
    var keyArray        =   keyString.split('|');
    var reverseKeyArray =   keyArray.reverse();
    var reverseKeyString=   salt+'|'+status+'|'+reverseKeyArray.join('|');
    
    var cryp = crypto.createHash('sha512'); 
    cryp.update(reverseKeyString);
    var calchash = cryp.digest('hex');
    var expirationperiod=0;
    var downloadlimit=0;
    if(productinfo == "startup"){
        downloadlimit=25;
        expirationperiod=3;
    }else if(productinfo == "company"){
        downloadlimit=100;
        expirationperiod=6;
    }else if(productinfo == "enterprise"){
        downloadlimit=200;
        expirationperiod=12;
    }
    var msg = 'Payment failed for Hash not verified...';
    if(calchash == resphash)
        msg = 'Transaction Successful and Hash Verified...';
    console.log("email", String(req.body.email).trim());
        User.findOne({
            email: String(req.body.email).trim()
        })
        .exec()
        .then(user => {
            console.log("userupdate", user);
            console.log("userupdatecount", user.resumedownloadlimit);
var CurrentDate = new Date();
console.log("Current date:", CurrentDate);
CurrentDate.setMonth(CurrentDate.getMonth() + expirationperiod);
console.log("Date after " + expirationperiod + " months:", CurrentDate);
            
                console.log("update" + user.resumedownloadlimit + downloadlimit + " expiration:", CurrentDate);
                User.update({
                    email: String(req.body.email).trim()
                }, {
                    $set: {resumedownloadlimit: user.resumedownloadlimit + downloadlimit,expirationdate:CurrentDate}
                })
                .exec()
                .then(result => {
                    console.log(result);
                    result.resumedownloadlimit = user.resumedownloadlimit + downloadlimit;
                 res.status(200).json(result);
                // res.render(__dirname + '/response.html', {key: key,salt: salt,txnid: txnid,amount: amount, productinfo: productinfo, 
                //     firstname: firstname, email: email, mihpayid : mihpayid, status: status,resphash: resphash,msg:msg});
                })
                .catch(err => {
                    console.log(err);
                    res.status(500).json({
                        error: err
                    });
                });
            
           
        })
        .catch(err => {

            res.status(500).json({
                error: err
            });
        });
    // res.render(__dirname + '/response.html', {key: key,salt: salt,txnid: txnid,amount: amount, productinfo: productinfo, 
    // firstname: firstname, email: email, mihpayid : mihpayid, status: status,resphash: resphash,msg:msg});
});




app.post('/reducedownloadcount', function(req, res){
    User.update({
        email: String(req.body.email).trim()
    }, {
        $set: {resumedownloadlimit: user.resumedownloadlimit - 1}
    })
    .exec()
    .then(result => {
        console.log(result);
        res.status(200).json(result);
    })
    .catch(err => {
        console.log(err);
        res.status(500).json({
            error: err
        });
    });

});

app.post('/checkplanstatus', function(req, res){
    console.log("checkpal"+ req.body);
    User.findOne({
        email: String(req.body.email).trim()
    })
    .exec()
    .then(user => {
        var isActive;

         console.log("userlimit", user);
        if(user.resumedownloadlimit > 0){
            isActive=true;
        }
        else{
            isActive=false;
        }
        var CurrentDate = new Date();
        var expirationdate =new Date(user.expirationdate);
        timeDifference = Math.abs(expirationdate.getTime() - CurrentDate.getTime());

        console.log(timeDifference);    
        
        
        let differentDays = Math.ceil(timeDifference / (1000 * 3600 * 24));
        
        console.log("diffday" +differentDays);
    
        
        if((user.resumedownloadlimit > 0 ) && (differentDays >0)){
            isActive=true;
        }else
        {
            isActive =false
        }
        console.log("isactive" + String(isActive));

        res.status(200).json(isActive);
        // console.log("userupdate", user);
        // console.log("userupdatecount", user.resumedownloadlimit);
        // var CurrentDate = new Date();
        // console.log("Current date:", CurrentDate);
        // CurrentDate.setMonth(CurrentDate.getMonth() + expirationperiod);
        // console.log("Date after " + expirationperiod + " months:", CurrentDate);
                
        //  console.log("update" + user.resumedownloadlimit + downloadlimit + " expiration:", CurrentDate);     
       
    })
    .catch(err => {

        res.status(500).json({
            error: err
        });
    });

});

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
