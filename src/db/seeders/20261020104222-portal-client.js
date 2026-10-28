'use strict';

const crypto = require('crypto');

module.exports = {
  async up(queryInterface) {
    await queryInterface.bulkInsert('clients', [{
      name: 'Portal',
      api_key_hash: crypto.createHash('sha256').update('portal-dev-key').digest('hex'),
      created_at: new Date(),
      updated_at: new Date(),
    }], {ignoreDuplicates: true});
  },

  async down(queryInterface) {
    await queryInterface.bulkDelete('clients', {name: 'Portal'});
  },
};