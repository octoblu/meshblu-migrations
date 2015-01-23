var async = require('async');
var _ = require('lodash');
var connection = require('../connection');
var count = 0;

exports.up = function(success, error) {
  connection.then(function(db){
    return db.collection('devices').find({type: 'device:gateblu'}).each(function(error, device){
      if(error){ return; }
      if(!device){ return success(); }
      db.collection('devices').update({uuid: device.uuid}, {$set: {discoverWhitelist: [device.owner]}}, _.noop);
    });
  }, function(err){
    if(err){ return error(err); }
    success();
  });
};

exports.down = function(success, error) {
  connection.then(function(db){
    return db.collection('devices').find({type: 'device:gateblu'}).each(function(error, device){
      if(error){ return; }
      if(!device){ return success(); }
      db.collection('devices').update({uuid: device.uuid}, {$unset: {discoverWhitelist: true}}, _.noop);
    });
  }, function(err){
    if(err){ return error(err); }
    success();
  });
};
