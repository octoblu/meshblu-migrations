var mongodb = require('mongodb');
var Connection = require('./connection');
var connection = new Connection(mongodb.MongoClient);
var debug = require('debug')('meshblu-migrations:mongo-storage');

module.exports = {
    // Should invoke callback with data string
    get: function(callback) {
      connection.getMeshbluConnection().then(function(db){
        db.collection('mgrt').findOne(function(err, result){
          if (result) {
            data = result.data;
          } else {
            data = '[]';
          }
          debug('Got Data', data);
          callback(data);
        });
      });
    },

    // Should save data string somewhere and then invoke callback
    // You only need to store single string somewhere in db
    set: function(data_string, callback) {
      connection.getMeshbluConnection().then(function(db){
        var collection = db.collection('mgrt');
        debug('Removing MGRT record');
        collection.remove({}, {w:0});
        debug('Inserting data:', data_string);
        collection.insert([{data: data_string}], {w:0});
        callback();
      });
    }
};
