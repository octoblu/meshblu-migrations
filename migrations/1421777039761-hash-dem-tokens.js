var _ = require('lodash');
var async = require('async');
var bcrypt = require('bcrypt');
var connection = require('../connection');

exports.up = function(success, error) {
  connection.then(function(db){
    var collection = db.collection('devices');

    var q = async.queue(function (doc, callback) {
      // code for your update
      if (!_.isString(doc.token)) {
        callback();
        return;
      }
      if (doc.token[0] === '$') {
        callback();
        return;
      }
      collection.update({
        _id: doc._id
      }, {
        $set: {token : bcrypt.hashSync(doc.token, 8)}
      }, {
        w: 1
      }, callback);
    }, Infinity);

    var cursor = collection.find({});
    cursor.each(function(err, doc) {
      if (err) error(err);
      if (doc) q.push(doc); // dispatching doc to async.queue
    });

    q.drain = function() {
      if (cursor.isClosed()) {
        console.log('all items have been processed');
        db.close();
        success()
      }
    }
  });
};

exports.down = function(success, error) {
  error('There is no return');
};



