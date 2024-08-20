const { PrismaClient } = require('@prisma/client');
const axios = require('axios');
const prisma = new PrismaClient();

async function processTransaction(transaction) {
  return new Promise((resolve) => {
    console.log('Transaction processing started for:', transaction);

    setTimeout(() => {
      console.log('Transaction processed for:', transaction);
      resolve(transaction);
    }, 30000);
  });
}

exports.sendPayment = async (req, reply) => {
  const token = req.headers.authorization.split(' ')[1];

  // Verify user with Account Manager
  try {
    const response = await axios.get(`${process.env.ACCOUNT_MANAGER_URL}/api/accounts`, {
      headers: { Authorization: `Bearer ${token}` },
    });

    if (response.status !== 200) {
      return reply.status(401).send({ error: 'Unauthorized' });
    }
  } catch (error) {
    return reply.status(401).send({ error: 'Unauthorized' });
  }

  const { amount, toAddress, accountId } = req.body;

  const transaction = await prisma.transaction.create({
    data: {
      amount,
      toAddress,
      status: 'PENDING',
      accountId,
    },
  });

  const processedTransaction = await processTransaction(transaction);
  await prisma.transaction.update({
    where: { id: transaction.id },
    data: { status: 'COMPLETED' },
  });

  return reply.send({ transaction: processedTransaction });
};

exports.withdrawPayment = async (req, reply) => {
  const token = req.headers.authorization.split(' ')[1];

  // Verify user with Account Manager
  try {
    const response = await axios.get(`${process.env.ACCOUNT_MANAGER_URL}/api/accounts`, {
      headers: { Authorization: `Bearer ${token}` },
    });

    if (response.status !== 200) {
      return reply.status(401).send({ error: 'Unauthorized' });
    }
  } catch (error) {
    return reply.status(401).send({ error: 'Unauthorized' });
  }

  const { amount, toAddress, accountId } = req.body;

  const transaction = await prisma.transaction.create({
    data: {
      amount: -amount,
      toAddress,
      status: 'PENDING',
      accountId,
    },
  });

  const processedTransaction = await processTransaction(transaction);
  await prisma.transaction.update({
    where: { id: transaction.id },
    data: { status: 'COMPLETED' },
  });

  return reply.send({ transaction: processedTransaction });
};
