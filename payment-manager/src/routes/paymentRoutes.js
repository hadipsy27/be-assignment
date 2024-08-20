const { sendPayment, withdrawPayment } = require('../controllers/paymentController');

module.exports = async function (fastify) {
  fastify.post('/send', sendPayment);
  fastify.post('/withdraw', withdrawPayment);
};
