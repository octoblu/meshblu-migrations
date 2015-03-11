require('coffee-script/register');

var Connection = require('../connection');
var mongodb = require('mongodb');
var connection = new Connection(mongodb.MongoClient);
var when = require('when');
var AuthenticatorMigrator = require('../models/authenticator-migrator');
var EMAIL_AUTHENTICATOR_UUID = process.env.EMAIL_AUTHENTICATOR_UUID;

exports.up = function(successCallback, errorCallback) {
  var meshbluDBPromise = connection.getMeshbluConnection();
  var octobluDBPromise = connection.getOctobluConnection();

  when.all([meshbluDBPromise, octobluDBPromise]).then(function(dbConnections){
    devicesCollection = dbConnections[0].collection('devices');
    usersCollection = dbConnections[1].collection('users');

    var authenticatorMigrator = new AuthenticatorMigrator(
      EMAIL_AUTHENTICATOR_UUID,
      'email-password',
      'email',
      'local',
      usersCollection,
      devicesCollection
    );

    authenticatorMigrator.migrate(function(error){
      if(error) {
        return errorCallback(error);
      }
      successCallback();
    });
  });
};

exports.down = function(success, error) {
	error('Please populate migration');
};
