/**
 * Utility to fetch files from OneDrive public links
 * Converts OneDrive sharing links to direct download links
 * CORS proxy usage can be toggled via USE_CORS_PROXY env
 */

const CORSProxy = require('./corsProxy')

const OneDriveUtil = function () {
  var self = {}
  const corsProxy = new CORSProxy()
  const useCorsProxy = process.env.USE_CORS_PROXY !== 'false'

  const parseAndValidateOneDriveUrl = function (url) {
    if (!url || typeof url !== 'string') {
      return null
    }

    let parsedUrl

    try {
      parsedUrl = new URL(url)
    } catch (_error) {
      return null
    }

    const hostname = parsedUrl.hostname.toLowerCase()
    const isSharePointHost = hostname === 'sharepoint.com' || hostname.endsWith('.sharepoint.com')
    const isOneDriveLiveHost = hostname === 'onedrive.live.com'
    const isOneDriveShortHost = hostname === '1drv.ms'

    if (!isSharePointHost && !isOneDriveLiveHost && !isOneDriveShortHost) {
      return null
    }

    return {
      isSharePointHost,
      isOneDriveShortHost,
    }
  }

  /**
   * Convert OneDrive sharing link to direct download link
   * @param {string} oneDriveUrl - OneDrive sharing URL
   * @returns {string} Direct download URL
   */
  self.convertToDirectUrl = function (oneDriveUrl) {
    const parsed = parseAndValidateOneDriveUrl(oneDriveUrl)

    if (!parsed) {
      throw new Error('Invalid OneDrive URL')
    }

    const { isSharePointHost, isOneDriveShortHost } = parsed

    // For SharePoint sharing links, convert to download endpoint
    if (isSharePointHost) {
      let url = oneDriveUrl.replace(/\/$/, '')

      return url.includes('?') ? url + '&download=1' : url + '?download=1'
    }

    // Handle 1drv.ms short URLs
    if (isOneDriveShortHost) {
      return oneDriveUrl.replace(/\/$/, '') + '?download=1'
    }

    // Handle full OneDrive URLs - Extract resource ID
    let resIdMatch = oneDriveUrl.match(/resid=([A-F0-9]+%21[A-F0-9]+)/i)
    if (resIdMatch) {
      return 'https://api.onedrive.com/v1.0/drives/me/items/' + resIdMatch[1] + '/content'
    }

    // If it's a direct sharing link format
    const rIdMatch = oneDriveUrl.match(/[?&]rId=([^&]+)/i)
    if (rIdMatch) {
      const baseUrl = oneDriveUrl.replace(/\?.*/, '')
      return baseUrl + '?download=1'
    }

    // Fallback
    const baseUrl = oneDriveUrl.replace(/\/$/, '').split('?')[0]
    return baseUrl + '?download=1'
  }

  /**
   * Fetch XLSX file from OneDrive and return array buffer
   * Uses CORS proxy by default; can fetch directly when USE_CORS_PROXY=false
   * @param {string} oneDriveUrl - OneDrive sharing URL
   * @returns {Promise<ArrayBuffer>}
   */
  self.fetchExcelFile = async function (oneDriveUrl) {
    try {
      const directUrl = self.convertToDirectUrl(oneDriveUrl)

      console.log('[OneDrive] Fetching from: ', directUrl)
      console.log('[OneDrive] Proxy enabled: ', useCorsProxy)

      const response = useCorsProxy ? await corsProxy.fetchThroughProxy(directUrl) : await fetch(directUrl)

      console.log('[OneDrive] Response status: ', response.status)

      if (!response.ok) {
        throw new Error(`OneDrive HTTP error: ${response.status} ${response.statusText || ''}`.trim())
      }

      const buffer = await response.arrayBuffer()
      console.log('[OneDrive] Got buffer, size: ', buffer.byteLength)

      // Debug: check first bytes (should start with PK for XLSX)
      const firstBytes = new Uint8Array(buffer).slice(0, 4)
      console.log(
        '[OneDrive] First bytes:',
        Array.from(firstBytes)
          .map((b) => b.toString(16))
          .join(' '),
      )

      return buffer
    } catch (error) {
      console.error('[OneDrive] Fetch error:', error)
      throw new Error(`OneDrive fetch error: ${error.message}`)
    }
  }

  /**
   * Validate OneDrive URL format
   * @param {string} url
   * @returns {boolean}
   */
  self.isValidOneDriveUrl = function (url) {
    return Boolean(parseAndValidateOneDriveUrl(url))
  }

  return self
}

module.exports = OneDriveUtil
