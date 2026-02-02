/**
 * Google Sheets proxy routes
 */

const express = require('express')
const axios = require('axios')

const { sendError, sendFileResponse, validateXlsxBuffer } = require('../helpers')
const { validateUrlParam } = require('../middleware')

const router = express.Router()

/**
 * Google Sheets download proxy endpoint
 * GET /api/google-sheets-file?url=<encoded-url>
 */
router.get('/api/google-sheets-file', validateUrlParam, async (req, res) => {
  try {
    const fileUrl = req.decodedUrl
    console.log('Proxying Google Sheets:', fileUrl)

    const response = await axios.get(fileUrl, {
      headers: {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36',
      },
      responseType: 'arraybuffer',
    })

    console.log(`Status: ${response.status}`)
    validateXlsxBuffer(response.data)
    sendFileResponse(res, response.data)
  } catch (error) {
    const statusCode = error.statusCode || 500
    const errorType = error.errorType || 'Google Sheets Proxy Error'
    sendError(res, statusCode, errorType, error.message)
  }
})

module.exports = router
