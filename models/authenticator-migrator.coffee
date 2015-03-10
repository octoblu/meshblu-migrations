meshblu = require 'meshblu'
uuidGen = require 'node-uuid'
{DeviceAuthenticator} = require 'meshblu-authenticator-core'

class AuthenticatorMigrator
  constructor: (@authenticatorUuid, @authenticatorName, @userId, @usersCollection, @devicesCollection) ->
    @devicesCollection._update = @devicesCollection.update

    @devicesCollection.update = (query, device, callback) =>

      device.discoverWhitelist = [ device.uuid, @authenticatorUuid ]
      device.configureWhitelist = [ device.uuid, @authenticatorUuid ]

      @devicesCollection._update query, { $set: device }, callback


  getMeshbluConnection : (callback) =>
    conn = meshblu.createConnection(
      uuid: @authenticatorUuid
      token: 'not-real-token'
    )
    @devicesCollection.findOne({uuid: @authenticatorUuid}, { privateKey: true }, (error, device) =>
      return  console.log(error) if error? || !device?
      conn.setPrivateKey device.privateKey
      callback null, conn
    )

  updateUserDevice : (user, authenticator) =>
    @devicesCollection.findOne { uuid: user.skynet.uuid }, (error, device) =>
      return console.error('somehow, user ' + user[@userId] + ' has no device.') if error || !device

      tempPassword = 'password'
      authenticator.addAuth { hello: tempPassword }, user.skynet.uuid, user[@userId], tempPassword, (error, device) =>
        console.error 'Error adding auth', error if error?

  migrate : (callback) =>
    @getMeshbluConnection (error, conn) =>
      authenticator = new DeviceAuthenticator(
        @authenticatorUuid,
        @authenticatorName,
        meshblu: conn
        meshbludb: @devicesCollection
      )

      @usersCollection.find(local: $exists: true).each (error, user) =>
        return if error?
        return callback() if !user?
        @updateUserDevice user, authenticator

module.exports = AuthenticatorMigrator
