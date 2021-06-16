// Import the required modules
const mongodb = require('mongodb');
let database;

// Function to connect to the MongoDB server and store that connection
function mongoConnect(mongoDbUri, callback) {
    mongodb.MongoClient.connect(mongoDbUri, { useNewUrlParser: true, useUnifiedTopology: true })
        .then(dbclient => {
            console.log('Connected to database server');
            database = dbclient.db();
            callback();
        })
        .catch(err => {
            console.log('Cannot connect to database server');
            throw err;
        });
};

// Function to get access object to the MongoDB database
function getDb() {
    if (database) {
        return database;
    } else {
        throw 'Database not found';
    };
    
};

exports.mongoConnect = mongoConnect;
exports.getDb = getDb;