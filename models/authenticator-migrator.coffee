meshblu = require 'meshblu'
uuidGen = require 'node-uuid'
{DeviceAuthenticator} = require 'meshblu-authenticator-core'

class AuthenticatorMigrator
  constructor: (@authenticatorUuid, @authenticatorName, @userId, @octobluProperty, @usersCollection, @devicesCollection) ->

    @devicesCollection._update = @devicesCollection.update

    @devicesCollection.update = (query, device, callback=->) =>
      device.discoverWhitelist = [ device.uuid, @authenticatorUuid ]
      device.configureWhitelist = [ device.uuid, @authenticatorUuid ]
      @devicesCollection._update query, { $set: device }, callback


  getMeshbluConnection : (callback=->) =>
    conn = meshblu.createConnection(
      uuid: @authenticatorUuid
      token: 'not-real-token'
    )

    @devicesCollection.findOne({uuid: @authenticatorUuid}, { privateKey: true }, (error, device) =>
      return callback error if error?
      return callback new Error("authenticator device does not exist") unless device?
      conn.setPrivateKey device.privateKey
      callback null, conn
    )

  updateUserDevice : (user, authenticator, callback=->) =>
    return callback null, null unless user.skynet?.uuid?
    @devicesCollection.findOne { uuid: user.skynet.uuid }, (error, device) =>
      return callback new Error('somehow, user ' + user[@userId] + ' has no device.') if error || !device

      tempPassword = uuidGen.v4()
      authenticator.addAuth { hello: tempPassword }, user.skynet.uuid, user[@userId], tempPassword, (error, device) =>
        return callback error if error?
        callback null, device

  migrate : (callback=->) =>
    @getMeshbluConnection (error, conn) =>
      return callback error if error?
      authenticator = new DeviceAuthenticator(
        @authenticatorUuid,
        @authenticatorName,
        meshblu: conn
        meshbludb: @devicesCollection
      )
      query = {}
      query[@octobluProperty] = $exists: true
      userCursor = @usersCollection.find query

      userIterator = (err, user)=>
        return @updateUserDevice(user, authenticator, () => userCursor.nextObject(userIterator) ) if user?
        callback()

      userCursor.nextObject userIterator

module.exports = AuthenticatorMigrator
