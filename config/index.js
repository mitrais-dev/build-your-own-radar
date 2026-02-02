require('dotenv').config()

const env = {
  // Backend configuration
  PORT: process.env.PORT || 3001,
  NODE_ENV: process.env.NODE_ENV || 'development',

  // Frontend configuration
  BACKEND_URL: process.env.BACKEND_URL || 'http://localhost:3001',
}

module.exports = env
