const jwt = require('jsonwebtoken');
const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function authenticate(req, reply, next) {
  try {
    const authHeader = req.headers.authorization;

    if (!authHeader) {
      reply.log.error('Authorization header is missing');
      return reply.status(401).send({ error: 'Authorization header is missing' });
    }

    const token = authHeader.split(' ')[1];

    if (!token) {
      reply.log.error('Token is missing');
      return reply.status(401).send({ error: 'Token is missing' });
    }

    // Verify the token
    let decoded;
    try {
      decoded = jwt.verify(token, process.env.JWT_SECRET);
    } catch (err) {
      reply.log.error('JWT verification failed:', err.message);
      return reply.status(401).send({ error: 'Invalid or expired token' });
    }
    
    if (!decoded || !decoded.userId) {
      reply.log.error('Decoded token is invalid or missing userId');
      return reply.status(401).send({ error: 'Invalid or expired token' });
    }

    const user = await prisma.user.findUnique({
      where: { id: decoded.userId },
    });

    if (!user) {
      reply.log.error('No user found for the provided userId');
      return reply.status(401).send({ error: 'Invalid or expired token' });
    }

    req.user = { id: user.id };

    next();
  } catch (err) {
    reply.log.error('Unexpected error during authentication:', err.message || err);
    return reply.status(500).send({ error: 'An error occurred during authentication' });
  }
}

module.exports = authenticate;
