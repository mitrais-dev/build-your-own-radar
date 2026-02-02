/**
 * CORS and security middleware
 */

/**
 * Enable CORS for all routes
 */
const corsMiddleware = (req, res, next) => {
  res.header('Access-Control-Allow-Origin', '*')
  res.header('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS')
  res.header('Access-Control-Allow-Headers', 'Content-Type, Authorization')

  // Handle preflight requests
  if (req.method === 'OPTIONS') {
    return res.sendStatus(200)
  }

  next()
}

/**
 * Validate URL parameter middleware
 */
const validateUrlParam = (req, res, next) => {
  const { url } = req.query

  if (!url) {
    return res.status(400).json({ error: 'URL parameter required' })
  }

  // Attach decoded URL to request
  req.decodedUrl = decodeURIComponent(url)
  next()
}

module.exports = {
  corsMiddleware,
  validateUrlParam,
}
