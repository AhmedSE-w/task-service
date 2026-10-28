const Client = require('./models/client.model');

const findByApiKeyHash = async (apiKeyHash) => {
  return Client.findOne({where: {api_key_hash: apiKeyHash}});
};

module.exports = {findByApiKeyHash};
