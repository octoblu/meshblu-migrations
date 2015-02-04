var mongodb = require('mongodb');
var when    = require('when');

var mongodb_uri = process.env.MGRT_MESHBLUDB_URI || 'mongodb://127.0.0.1:27017/skynet';
var octobludb_uri = process.env.MGRT_OCTOBLUDB_URI || 'mongodb://127.0.0.1:27017/meshines';

function Connection(mongoClient){
  var self = this;
  self.mongoClient = mongoClient;

  self.getMeshbluConnection = function(){
    return when.promise(function(resolve, reject, notify){
        self.mongoClient.connect(mongodb_uri, function(error, db){
          if(error){
            return reject(error);
          }
          resolve(db);
        });
      }); 
  }
  self.getOctobluConnection = function(){
     return when.promise(function(resolve, reject, notify){
        self.mongoClient.connect(octobludb_uri, function(error, db){
          if(error){
            return reject(error);
          }
          resolve(db);
        });
      }); 
  }
  return self; 
}

module.exports = Connection;
