const Fastify = require('fastify');
const prisma = require('@prisma/client');
const paymentRoutes = require('./routes/paymentRoutes');

const fastify = Fastify({ logger: true });

fastify.register(paymentRoutes, { prefix: '/api/payments' });

const start = async () => {
  try {
    await fastify.listen({ port: 3002, host: '0.0.0.0' });
    console.log('Payment Manager Service is running on port 3001');
  } catch (err) {
    fastify.log.error(err);
    process.exit(1);
  }
};

start();
