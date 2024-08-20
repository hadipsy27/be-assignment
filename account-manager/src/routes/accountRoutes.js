const { registerUser, loginUser, getAccounts, getTransactions } = require('../controllers/accountController');
const authenticate = require('../middleware/authMiddleware');

module.exports = async function (fastify) {
  fastify.post('/register', registerUser);
  fastify.post('/login', loginUser);

  fastify.get('/accounts', { preHandler: authenticate }, getAccounts);
  fastify.get('/transactions/:accountId', { preHandler: authenticate }, getTransactions);
};
