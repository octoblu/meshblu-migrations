var mongodb = require('mongodb');
var when    = require('when');

mongodb_uri = process.env.MGRT_MONGODB_URI || 'mongodb://127.0.0.1:27017/skynet'

module.exports = when.promise(function(resolve, reject, notify){
  mongodb.MongoClient.connect(mongodb_uri, function(error, db){
    resolve(db);
  });
});
