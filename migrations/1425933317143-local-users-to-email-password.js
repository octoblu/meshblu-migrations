require('coffee-script/register');

var Connection = require('../connection');
var mongodb = require('mongodb');
var connection = new Connection(mongodb.MongoClient);
var when = require('when');
var AuthenticatorMigrator = require('../models/authenticator-migrator');
var EMAIL_AUTHENTICATOR_UUID = '069f51a0-c6a7-11e4-9e26-3728eee3006d';

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
