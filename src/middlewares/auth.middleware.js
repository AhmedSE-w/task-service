const crypto = require('crypto');
const clientDal = require('../dal/client.dal');

const hashApiKey = (apiKey) => {
  return crypto.createHash('sha256').update(apiKey).digest('hex');
};

const authenticate = async (req, res, next) => {
  const apiKey = req.header('x-api-key');
  const userId = req.header('x-user-id');

  if (!apiKey || !userId) {
    return res.status(401).json({error: 'x-api-key and x-user-id headers are required'});
  }

  const client = await clientDal.findByApiKeyHash(hashApiKey(apiKey));
  if (!client) {
    return res.status(401).json({error: 'Invalid API key'});
  }

  req.clientId = client.id;
  req.userId = userId;
  next();
};

module.exports = {authenticate, hashApiKey};