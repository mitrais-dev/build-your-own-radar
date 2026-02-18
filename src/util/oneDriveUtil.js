/**
 * Utility to fetch files from OneDrive public links
 * Converts OneDrive sharing links to direct download links
 * Now fully frontend-only using free CORS proxy
 */

const CORSProxy = require('./corsProxy')

const OneDriveUtil = function () {
  var self = {}
  const corsProxy = new CORSProxy()

  /**
   * Convert OneDrive sharing link to direct download link
   * @param {string} oneDriveUrl - OneDrive sharing URL
   * @returns {string} Direct download URL
   */
  self.convertToDirectUrl = function (oneDriveUrl) {
    // For SharePoint sharing links, convert to download endpoint
    if (oneDriveUrl.includes('sharepoint.com')) {
      let url = oneDriveUrl.replace(/\/$/, '')

      return url.includes('?') ? url + '&download=1' : url + '?download=1'
    }

    // Check if it's a OneDrive URL
    const isValidUrl = oneDriveUrl.includes('onedrive.live.com') || oneDriveUrl.includes('1drv.ms')

    if (!isValidUrl) {
      throw new Error('Invalid OneDrive URL')
    }

    // Handle 1drv.ms short URLs
    if (oneDriveUrl.includes('1drv.ms')) {
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
   * Uses free CORS proxy for all URLs - fully frontend-only
   * @param {string} oneDriveUrl - OneDrive sharing URL
   * @returns {Promise<ArrayBuffer>}
   */
  self.fetchExcelFile = async function (oneDriveUrl) {
    try {
      const directUrl = self.convertToDirectUrl(oneDriveUrl)

      console.log('[OneDrive] Fetching from: ', directUrl)

      // Use free CORS proxy directly - no backend needed anymore
      const response = await corsProxy.fetchThroughProxy(directUrl)

      console.log('[OneDrive] Response status: ', response.status)

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
    return url && (url.includes('onedrive.live.com') || url.includes('1drv.ms') || url.includes('sharepoint.com'))
  }

  return self
}

module.exports = OneDriveUtil
