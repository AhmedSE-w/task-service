const crypto = require('crypto');
const clientDal = require('../dal/client.dal');

const hashApiKey = (apiKey) => {
  return crypto.createHash('sha256').update(apiKey).digest('hex');
};

const ROLES = ['admin', 'manager', 'worker'];

const authenticate = async (req, res, next) => {
  const apiKey = req.header('x-api-key');
  const userId = req.header('x-user-id');
  const userRole = req.header('x-user-role');

  if (!apiKey || !userId) {
    return res.status(401).json({error: 'x-api-key and x-user-id headers are required'});
  }

  if (!ROLES.includes(userRole)) {
    return res.status(400).json({error: 'x-user-role must be admin, manager or worker'});
  }

  const client = await clientDal.findByApiKeyHash(hashApiKey(apiKey));
  if (!client) {
    return res.status(401).json({error: 'Invalid API key'});
  }

  req.clientId = client.id;
  req.userId = userId;
  req.userRole = userRole;
  next();
};

module.exports = {authenticate, hashApiKey};
