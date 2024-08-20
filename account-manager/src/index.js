const Fastify = require('fastify');
const { PrismaClient } = require('@prisma/client');
const accountRoutes = require('./routes/accountRoutes');
require('dotenv').config();

const fastify = Fastify({ logger: true });
const prisma = new PrismaClient(); 

fastify.register(accountRoutes, { prefix: '/api/accounts' });

const cleanup = async () => {
  await prisma.$disconnect();
  process.exit(0);
};

process.on('SIGINT', cleanup);
process.on('SIGTERM', cleanup);

const start = async () => {
  try {
    await fastify.listen({ port: 3000, host: '0.0.0.0' });
    console.log('Account Manager Service is running on port 3000');
  } catch (err) {
    fastify.log.error(err);
    process.exit(1);
  }
};

start();
