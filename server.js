const app = require("./app");
const http = require("http");
var url = require('url');
const scheduler = require('./api/schedulers/scheduler')

const port = process.env.PORT || 3001;

const server = http.createServer(app).listen(port);


//console.log(app);