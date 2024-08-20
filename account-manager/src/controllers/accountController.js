const supabase = require('../utils/supabaseClient');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

exports.registerUser = async (req, reply) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return reply.status(400).send({ error: 'Email and password are required' });
    }

    const hashedPassword = await bcrypt.hash(password, 10);

    const user = await prisma.user.create({
      data: {
        email: email,
        password: hashedPassword,
      },
    });

    const token = jwt.sign({ userId: user.id }, process.env.JWT_SECRET, { expiresIn: '1h' });

    return reply.send({ user, token });
  } catch (error) {
    if (error.code === 'P2002') {
      return reply.status(400).send({ error: 'Email already exists' });
    }

    reply.log.error(error);
    return reply.status(500).send({ error: error.message || 'An internal server error occurred' });
  }
};

  
  exports.loginUser = async (req, reply) => {
    try {
      const { email, password } = req.body;
  
      const user = await prisma.user.findUnique({
        where: { email },
      });
  
      if (!user) {
        return reply.status(401).send({ error: 'Invalid email or password' });
      }
  
      const isPasswordValid = await bcrypt.compare(password, user.password);
  
      if (!isPasswordValid) {
        return reply.status(401).send({ error: 'Invalid email or password' });
      }
  
      const token = jwt.sign({ userId: user.id }, process.env.JWT_SECRET, { expiresIn: '1h' });
  
      return reply.send({ token });
    } catch (error) {
      reply.log.error(error);
      return reply.status(500).send({ error: 'An internal server error occurred' });
    }
  };

exports.getAccounts = async (req, reply) => {
  try {
      const userId = req.user?.id;

      reply.log.info(`Fetching accounts for userId: ${userId}`);

      const accounts = await prisma.account.findMany({
          where: {
              userId: userId 
          }
      });

      if (!accounts || accounts.length === 0) {
          reply.log.info('No accounts found for the user.');
          return reply.status(404).send({ message: 'No accounts found for the user.' });
      }

      return reply.send({ accounts: accounts });

  } catch (error) {
      reply.log.error('Internal server error:', error.message, error.stack);
      return reply.status(500).send({ error: 'An internal server error occurred' });
  }
};

exports.getTransactions = async (req, reply) => {
  try {
    const { accountId } = req.params;

      const historyTransaction = await prisma.paymentHistory.findFirst({
        where: {
          accountId: accountId
        }
      })

    return reply.send({ transactions: historyTransaction });

  } catch (error) {
    if (!reply.sent) {
      reply.log.error(error);
      reply.status(500).send({ error: 'An internal server error occurred' });
    }
  }
};
