var Connection = require('../connection');
var mongodb = require('mongodb');
var connection = new Connection(mongodb.MongoClient);
var when = require('when');
var _ = require('lodash');
var EMAIL_AUTHENTICATOR_UUID = '069f51a0-c6a7-11e4-9e26-3728eee3006d';
var meshblu = require('meshblu');

exports.up = function(success, error) {
  var meshbluDBPromise = connection.getMeshbluConnection();
  var octobluDBPromise = connection.getOctobluConnection();

  when.all([meshbluDBPromise, octobluDBPromise]).then(function(dbConnections){
    devicesCollection = dbConnections[0].collection('devices');
    usersCollection = dbConnections[1].collection('users');

    usersCollection.find({local: {$exists: true}}).each(function(error, user) {
      if(error || !user) {
        return console.log('error!!', error, user);
      }
      updateUserDevice(user);
    });

    function updateUserDevice(user) {
      console.log(user.skynet.uuid)
      devicesCollection.findOne({uuid: user.skynet.uuid}, function(error, device){
         if(error || !device) {
              return console.log('somehow, user ' + user.email + ' has no device.');
          }
          device.discoverWhitelist = device.discoverWhitelist || [];
          device.configureWhitelist = device.configureWhitelist || [];

          device.discoverWhitelist.push(EMAIL_AUTHENTICATOR_UUID)
          device.configureWhitelist.push(EMAIL_AUTHENTICATOR_UUID)

          device.discoverWhitelist = _.uniq(device.discoverWhitelist);
          device.configureWhitelist = _.uniq(device.configureWhitelist);

          devicesCollection.update({uuid: device.uuid}, device,
          function(error, code) {
            if(error) {
              return console.log('error!!', error);
            }
            registerWithAuthenticator(device);
          });
      });
    }

    function registerWithAuthenticator(device) {
      console.log('one day, this will register the device with the authenticator!', device);
    }
  });
};

exports.down = function(success, error) {
	error('Please populate migration');
};
