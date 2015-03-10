var DeviceAuthenticator = require('meshblu-authenticator-core').DeviceAuthenticator;
var meshblu = require('meshblu');

var Connection = require('../connection');
var mongodb = require('mongodb');
var connection = new Connection(mongodb.MongoClient);
var when = require('when');
var _ = require('lodash');
var request = require('request');
var uuidGen = require('node-uuid');

var EMAIL_AUTHENTICATOR_UUID = '069f51a0-c6a7-11e4-9e26-3728eee3006d';

exports.up = function(success, error) {
  var meshbluDBPromise = connection.getMeshbluConnection();
  var octobluDBPromise = connection.getOctobluConnection();

  when.all([meshbluDBPromise, octobluDBPromise]).then(function(dbConnections){
    devicesCollection = dbConnections[0].collection('devices');
    usersCollection = dbConnections[1].collection('users');

    devicesCollection._update = devicesCollection.update;

    devicesCollection.update = function(query, device, callback) {

      device.discoverWhitelist = [device.uuid, EMAIL_AUTHENTICATOR_UUID];
      device.configureWhitelist = [device.uuid, EMAIL_AUTHENTICATOR_UUID];

      return devicesCollection._update(query, {$set: device}, callback);
    };

    getMeshbluConnection(devicesCollection, function(error, device){
      var authenticator = new DeviceAuthenticator(
        EMAIL_AUTHENTICATOR_UUID,
       'email-password',
        { meshblu:  conn, meshbludb: devicesCollection}
      );

      usersCollection.find({local: {$exists: true}}).each(function(error, user) {
        if(error || !user) {
          return console.log('error!!', error, user);
        }
        updateUserDevice(user, authenticator);
      });
    });

    function getMeshbluConnection(devicesCollection, callback) {
      var conn = meshblu.createConnection({ uuid: EMAIL_AUTHENTICATOR_UUID, token: 'not-real-token'});
      devicesCollection.findOne({uuid: EMAIL_AUTHENTICATOR_UUID}, {privateKey: true}, function(error, device){
        conn.setPrivateKey(device.privateKey);
        callback(null, conn);
      });
    }

    function updateUserDevice(user, authenticator) {
      devicesCollection.findOne({uuid: user.skynet.uuid}, function(error, device){
        if(error || !device) {
          return console.error('somehow, user ' + user.email + ' has no device.');
        }
        var tempPassword = uuidGen.v4();
        authenticator.addAuth({ hello: uuidGen.v4() }, user.skynet.uuid, user.email, tempPassword, function(error, device){
          console.log(arguments);
        });
      });
    }

  });
};

exports.down = function(success, error) {
	error('Please populate migration');
};
