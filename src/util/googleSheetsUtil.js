/**
 * Utility to fetch files from Google Sheets
 * Converts Google Sheets URLs to download links (CSV format)
 */

const GoogleSheetsUtil = function () {
  var self = {}

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
   * Uses backend proxy to handle CORS and download the file
   * @param {string} sheetsUrl - Google Sheets URL or sheet ID
   * @returns {Promise<ArrayBuffer>}
   */
  self.fetchExcelFile = async function (sheetsUrl) {
    try {
      const xlsxUrl = self.convertToXlsxUrl(sheetsUrl)

      console.log('Fetching Google Sheet XLSX from: ', xlsxUrl)

      // Use backend proxy to download the file
      const backendUrl = process.env.BACKEND_URL || 'http://localhost:3001'
      const proxyUrl = `${backendUrl}/api/google-sheets-file?url=${encodeURIComponent(xlsxUrl)}`
      console.log('Using proxy:', proxyUrl)

      const response = await fetch(proxyUrl)

      console.log('Response status: ', response.status)

      if (!response.ok) {
        throw new Error(`Failed: ${response.status} ${response.statusText}`)
      }

      const buffer = await response.arrayBuffer()
      console.log('Got buffer, size: ', buffer.byteLength)

      return buffer
    } catch (error) {
      console.error('Fetch error:', error)
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
