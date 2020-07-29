const process = require("process");

let machine = process.env.NODE_ENV || 'local';
console.log("In",machine,'environment');

// Global Constants
switch (machine) {
    case 'local':
        process.env.SERVER_IP = "localhost:3001";
        process.env.SERVER_IP_WO_PORT = 'localhost';
        process.env.DB_URL = 'mongodb://localhost:27017/testdb';
        break;
    case 'dev':
        process.env.SERVER_IP = '34.224.1.240:3001';
        process.env.SERVER_IP_WO_PORT = '34.224.1.240';
        process.env.DB_URL = 'mongodb://localhost:27017/stag?authSource=admin';
        break;
    case 'prod':
        process.env.SERVER_IP = '34.224.1.240:3001';
        process.env.SERVER_IP_WO_PORT = '34.224.1.240';
        process.env.DB_URL = 'mongodb://localhost:27017/stag?authSource=admin';
        break;
    default:
        break;
}