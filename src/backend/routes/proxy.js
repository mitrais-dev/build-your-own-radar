/**
 * OneDrive/SharePoint proxy routes
 */

const express = require('express')
const axios = require('axios')
const { CookieJar } = require('tough-cookie')
const { wrapper } = require('axios-cookiejar-support')

const { sendError, sendFileResponse, validateXlsxBuffer } = require('../helpers')
const { validateUrlParam } = require('../middleware')

const router = express.Router()

/**
 * Proxy endpoint - fetch file from OneDrive/SharePoint
 * GET /api/proxy?url=<encoded-url>
 */
router.get('/api/proxy', validateUrlParam, async (req, res) => {
  try {
    const fileUrl = req.decodedUrl
    console.log('Proxying OneDrive/SharePoint:', fileUrl)

    // Fetch from OneDrive/SharePoint - with cookie jar
    const jar = new CookieJar()
    const axiosInstance = axios.create()
    wrapper(axiosInstance)

    const response = await axiosInstance.get(fileUrl, {
      jar,
      headers: {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36',
      },
      responseType: 'arraybuffer',
    })

    console.log(`Status: ${response.status}`)
    validateXlsxBuffer(response.data)
    sendFileResponse(res, response.data)
  } catch (error) {
    const invalidFormat = error.message.includes('Invalid file format')
    const statusCode = invalidFormat ? 400 : 500
    const errorType = invalidFormat ? 'Validation Error' : 'Proxy Error'

    sendError(res, statusCode, errorType, error.message)
  }
})

module.exports = router
