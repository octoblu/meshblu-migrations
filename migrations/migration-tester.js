migration = require('./1425933317143-local-users-to-email-password');

function success() {
  console.log('done!');
  process.exit(0);
}
function failure(error) {
  console.error(error);
  process.exit(-1);
}
migration.up(success, failure)
