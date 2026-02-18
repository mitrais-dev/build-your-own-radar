require('dotenv').config()

const env = {
  // Backend configuration
  PORT: process.env.PORT || 3001,
  NODE_ENV: process.env.NODE_ENV || 'development',

  // Frontend configuration
  CORS_PROXY: process.env.CORS_PROXY || 'allorigins',
  ALLOW_PUBLIC_URLS: process.env.ALLOW_PUBLIC_URLS || true,
}

module.exports = env
