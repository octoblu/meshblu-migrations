var async      = require('async');
var _          = require('lodash');
var mongodb    = require('mongodb');
var Connection = require('../connection');
var connection = new Connection(mongodb.MongoClient);

exports.up = function(success, error) {
  connection.getMeshbluConnection().then(function(db){
    return db.collection('devices').find({type: 'user'}).each(function(error, device){
      if(error){ return; }
      if(!device){ return success(); }
      db.collection('devices').update({uuid: device.uuid}, {$set: {discoverWhitelist: [device.uuid]}}, _.noop);
    });
  }, function(err){
    if(err){ return error(err); }
    success();
  });
};

exports.down = function(success, error) {
  connection.getMeshbluConnection().then(function(db){
    return db.collection('devices').find({type: 'user'}).each(function(error, device){
      if(error){ return; }
      if(!device){ return success(); }
      db.collection('devices').update({uuid: device.uuid}, {$unset: {discoverWhitelist: true}}, _.noop);
    });
  }, function(err){
    if(err){ return error(err); }
    success();
  });
};
