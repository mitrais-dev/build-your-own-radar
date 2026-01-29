/**
 * Simple Express proxy server for OneDrive/SharePoint downloads
 */

const express = require('express')
const axios = require('axios')
const { CookieJar } = require('tough-cookie')
const { wrapper } = require('axios-cookiejar-support')

const app = express()
const PORT = process.env.PORT || 3001

app.use(express.json())

/**
 * Proxy endpoint - fetch file from OneDrive/SharePoint
 * GET /api/proxy?url=<encoded-url>
 */
app.get('/api/proxy', async (req, res) => {
  try {
    const { url } = req.query

    if (!url) {
      return res.status(400).json({ error: 'URL parameter required' })
    }

    const fileUrl = decodeURIComponent(url)
    console.log('Proxying:', fileUrl)

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

    // Got the file
    const buffer = response.data
    console.log(`✓ Got buffer, size: ${buffer.byteLength} bytes`)

    // Check if it's valid XLSX (should start with PK zip magic bytes)
    const uint8 = new Uint8Array(buffer)
    const firstBytes = Array.from(uint8.slice(0, 4))
      .map((b) => b.toString(16))
      .join(' ')
    console.log(`First bytes: ${firstBytes}`)

    // Valid XLSX = 50 4b 03 04 (PK zip format)
    if (uint8[0] !== 0x50 || uint8[1] !== 0x4b) {
      console.error('⚠ WARNING: Buffer does NOT look like XLSX file!')
      console.error('Likely HTML/error response from SharePoint')
      // Try to show first 200 chars as text
      const text = new TextDecoder().decode(uint8.slice(0, 200))
      console.error('First 200 chars:', text)
    } else {
      console.log('✓ Buffer looks like valid XLSX')
    }

    res.setHeader('Content-Type', 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet')
    res.setHeader('Access-Control-Allow-Origin', '*')
    res.send(Buffer.from(buffer))
  } catch (error) {
    console.error('Proxy error:', error.message)
    res.status(500).json({
      error: 'Proxy error',
      message: error.message,
    })
  }
})

app.get('/health', (req, res) => {
  res.json({ status: 'OK', service: 'OneDrive Proxy Server' })
})

if (require.main === module) {
  app.listen(PORT, () => {
    console.log(`✓ Proxy server running on http://localhost:${PORT}`)
  })
}

module.exports = app
