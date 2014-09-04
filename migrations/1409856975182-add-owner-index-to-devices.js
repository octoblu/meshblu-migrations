var async = require('async');
var connection = require('../connection');

exports.up = function(success, error) {
  connection.then(function(db){
    async.eachSeries([{owner:1}, {socketId:1}], function(index, callback) {
      db.collection('devices').ensureIndex(index, callback);
    }, function(err){
      if(err){ return error(err); }
      success();
    });
  });
};

exports.down = function(success, error) {
  connection.then(function(db){
    async.eachSeries(['owner_1', 'socketId_1'], function(index, callback) {
      db.collection('devices').dropIndex(index, callback);
    }, function(err){
      if(err){ return error(err); }
      success();
    });
  });
};



