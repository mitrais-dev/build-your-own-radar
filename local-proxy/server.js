/* eslint-disable no-console */
const express = require('express')

const app = express()
const PORT = process.env.LOCAL_PROXY_PORT || 8787
const ALLOWED_HOSTS = ['docs.google.com']

function isAllowedTarget(urlString) {
  try {
    const parsed = new URL(urlString)
    return ['http:', 'https:'].includes(parsed.protocol) && ALLOWED_HOSTS.includes(parsed.hostname)
  } catch (_error) {
    return false
  }
}

app.get('/health', (_req, res) => {
  res.status(200).json({ ok: true })
})

app.get('/proxy', async (req, res) => {
  const targetUrl = req.query.url

  if (!targetUrl || typeof targetUrl !== 'string') {
    return res.status(400).json({ error: 'Query parameter "url" is required' })
  }

  if (!isAllowedTarget(targetUrl)) {
    return res.status(400).json({ error: 'Target URL is not allowed' })
  }

  try {
    const upstreamResponse = await fetch(targetUrl, {
      method: 'GET',
      redirect: 'follow',
      headers: {
        'User-Agent':
          'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/126.0.0.0 Safari/537.36',
      },
    })

    const contentType = upstreamResponse.headers.get('content-type')
    const contentDisposition = upstreamResponse.headers.get('content-disposition')
    const cacheControl = upstreamResponse.headers.get('cache-control')

    res.status(upstreamResponse.status)
    res.setHeader('Access-Control-Allow-Origin', '*')
    res.setHeader('Access-Control-Allow-Methods', 'GET, OPTIONS')
    res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization')

    if (contentType) {
      res.setHeader('Content-Type', contentType)
    }
    if (contentDisposition) {
      res.setHeader('Content-Disposition', contentDisposition)
    }
    if (cacheControl) {
      res.setHeader('Cache-Control', cacheControl)
    }

    const bodyBuffer = Buffer.from(await upstreamResponse.arrayBuffer())
    return res.send(bodyBuffer)
  } catch (error) {
    console.error('[local-proxy] request failed:', error)
    return res.status(502).json({ error: 'Proxy request failed', details: error.message })
  }
})

app.options('/proxy', (_req, res) => {
  res.setHeader('Access-Control-Allow-Origin', '*')
  res.setHeader('Access-Control-Allow-Methods', 'GET, OPTIONS')
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization')
  return res.status(204).send('')
})

app.listen(PORT, () => {
  console.log(`[local-proxy] listening on http://localhost:${PORT}`)
})
