var when = require('when');
var Connection = require('../connection');

describe('Connection', function () {

  var sut, mongoClient;
  beforeEach(function () {
    mongoClient = new FakeMongoClient();
    sut = new Connection(mongoClient);
  });


  describe('when connection is called', function(){
    it('should have a getOctobluConnection as a function property', function(){
      expect(sut.getOctobluConnection).to.exist;
    });

    it('should have a getMeshbluConnection as a function property', function(){
      expect(sut.getMeshbluConnection).to.exist;
    });
  });

  describe('getOctobluConnection', function(){
    var connectionPromise;
    beforeEach(function(){
      connectionPromise = sut.getOctobluConnection();
    });

    it('should return a promise', function(){
      expect(when.isPromiseLike(connectionPromise)).to.be.true;
    });

    describe('when it fails to connect to the database', function(){
      var error = {"message" : "It blew up"};
      beforeEach(function(){
        sut.mongoClient.connect = sinon.stub();
        sut.mongoClient.connect.yields(error);
        connectionPromise = sut.getOctobluConnection();
      });
      it('should reject the promise with an error', function(done){
        connectionPromise.catch(function(connectionError){
          expect(connectionError).to.deep.equal(error);
          done();
        });
      });
    })
  });


  describe('getMeshbluConnection', function(){
    var connectionPromise;
    beforeEach(function(){
      connectionPromise = sut.getMeshbluConnection();
    });
    it('should return a promise', function(){
      expect(when.isPromiseLike(connectionPromise)).to.be.true;
    });

    describe('when it fails to connect to the database', function(){
      var error = {"message" : "It blew up"};
      beforeEach(function(){
        sut.mongoClient.connect = sinon.stub();
        sut.mongoClient.connect.yields(error);
        connectionPromise = sut.getMeshbluConnection();
      });
      it('should reject the promise with an error', function(done){
        connectionPromise.catch(function(connectionError){
          expect(connectionError).to.deep.equal(error);
          done();
        });
      });
    });
    describe('the error message', function(){
      var error = {"message" : "should have connected to the database but I did not :("};
      beforeEach(function(){
        sut.mongoClient.connect = sinon.stub();
        sut.mongoClient.connect.yields(error);
        connectionPromise = sut.getMeshbluConnection();
      });
       it('should reject the promise with the same error', function(done){
        connectionPromise.catch(function(connectionError){
          expect(connectionError).to.deep.equal(error);
          done();
        });
      });

    });
  });

  var FakeMongoClient = function(){
    var self = this;

    self.connect = sinon.stub();
    return self;
  };
});
