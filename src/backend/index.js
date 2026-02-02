/**
 * Backend Express server - entry point
 */

require('dotenv').config()

const express = require('express')
const { corsMiddleware } = require('./middleware')
const proxyRoutes = require('./routes/proxy')
const googleSheetsRoutes = require('./routes/googleSheets')

const app = express()
const PORT = process.env.PORT || 3001

// Middleware
app.use(express.json())
app.use(corsMiddleware)

// Routes
app.use(proxyRoutes)
app.use(googleSheetsRoutes)

// Health check
app.get('/health', (req, res) => {
  res.json({ status: 'OK', service: 'Proxy Server (OneDrive/Google Sheets)' })
})

// Start server
if (require.main === module) {
  app.listen(PORT, () => {
    console.log(`✓ Proxy server running on http://localhost:${PORT}`)
  })
}

module.exports = app
