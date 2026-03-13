/**
 * Utility to fetch files from Google Sheets
 * Converts Google Sheets URLs to download links
 * CORS proxy usage can be toggled via USE_CORS_PROXY env
 * Now fully frontend-only without backend dependency
 */

const CORSProxy = require('./corsProxy')

const GoogleSheetsUtil = function () {
  var self = {}
  const corsProxy = new CORSProxy()
  const useCorsProxy = process.env.USE_CORS_PROXY !== 'false'

  /**
   * Extract spreadsheet ID from various Google Sheets URL formats
   * @param {string} url - Google Sheets URL
   * @returns {string} Spreadsheet ID
   */
  self.extractSpreadsheetId = function (url) {
    const match = url.match(/\/spreadsheets\/d\/([a-zA-Z0-9-_]+)/)
    if (!match) {
      throw new Error('Invalid Google Sheets URL format')
    }
    return match[1]
  }

  /**
   * Convert Google Sheets URL to XLSX export URL
   * @param {string} sheetsUrl - Google Sheets URL (full or just ID)
   * @returns {string} XLSX export URL
   */
  self.convertToXlsxUrl = function (sheetsUrl) {
    let spreadsheetId = sheetsUrl

    // If it's a full URL, extract the ID
    if (sheetsUrl.includes('/spreadsheets/d/')) {
      spreadsheetId = self.extractSpreadsheetId(sheetsUrl)
    }

    // Google Sheets XLSX export URL
    return `https://docs.google.com/spreadsheets/d/${spreadsheetId}/export?format=xlsx`
  }

  /**
   * Fetch XLSX file from Google Sheets
   * Uses CORS proxy by default; can fetch directly when USE_CORS_PROXY=false
   * @param {string} sheetsUrl - Google Sheets URL or sheet ID
   * @returns {Promise<ArrayBuffer>}
   */
  self.fetchExcelFile = async function (sheetsUrl) {
    try {
      const xlsxUrl = self.convertToXlsxUrl(sheetsUrl)

      console.log('[GoogleSheets] Fetching XLSX from: ', xlsxUrl)
      console.log('[GoogleSheets] Proxy enabled: ', useCorsProxy)

      const response = useCorsProxy ? await corsProxy.fetchThroughProxy(xlsxUrl) : await fetch(xlsxUrl)

      console.log('[GoogleSheets] Response status: ', response.status)

      const buffer = await response.arrayBuffer()
      console.log('[GoogleSheets] Got buffer, size: ', buffer.byteLength)

      return buffer
    } catch (error) {
      console.error('[GoogleSheets] Fetch error:', error)
      throw new Error(`Google Sheets fetch error: ${error.message}`)
    }
  }

  /**
   * Validate Google Sheets URL format
   * @param {string} url
   * @returns {boolean}
   */
  self.isValidGoogleSheetsUrl = function (url) {
    return url && (url.includes('docs.google.com/spreadsheets') || /^[a-zA-Z0-9-_]{20,}$/.test(url))
  }

  return self
}

module.exports = GoogleSheetsUtil
