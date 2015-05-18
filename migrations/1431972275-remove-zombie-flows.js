var Connection = require('../connection');
var mongodb = require('mongodb');
var connection = new Connection(mongodb.MongoClient);
var when = require('when');

exports.up = function(success, error) {
  var meshbluDBPromise = connection.getMeshbluConnection();
  var octobluDBPromise = connection.getOctobluConnection();
  var mgrtError = error;
  when.all([meshbluDBPromise, octobluDBPromise]).then(function(dbConnections){
    meshbluDb = dbConnections[0];
    octobluDb = dbConnections[1];
    meshbluDb.collection('devices').distinct('uuid', function(error, uuids){
      octobluDb.collection('flows').remove({flowId: { $nin: uuids }}, function(error, results){
        if(error){
          mgrtError('Bad stuff happened, you did not delete the ghost flow(s) booooooo');
        };
        success();
      });
    });
  });
};
exports.down = function(success, error) {
	throw("THERE IS NO DOWN ONLY ZUUL");
};
