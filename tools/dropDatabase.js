const readline = require('readline');
const mongoose = require('../config/mongo');
const config = require('../config/config');

(async () => {
  if (config.env !== 'test') {
    const theUserIsSure = await new Promise(resolve => readline
      .createInterface(process.stdin, process.stdout)
      .question(`WARNING: NODE_ENV=${config.env}. Are you sure you want to delete your ${config.env} database? (yes/no) `,
                answer => resolve(answer === 'yes'))
    );
    if (!theUserIsSure) {
      console.log('Aborting.');
      process.exit(2);
    }
  }
  await mongoose.connection.dropDatabase()
})()
.then(process.exit)
.catch((err) => {
  console.error(err);
  process.exit(1);
});
