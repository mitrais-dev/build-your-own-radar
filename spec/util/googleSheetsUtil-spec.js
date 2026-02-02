const GoogleSheetsUtil = require('../../src/util/googleSheetsUtil')

describe('GoogleSheetsUtil', () => {
  let util

  beforeEach(() => {
    util = new GoogleSheetsUtil()
    global.fetch = jest.fn()
    jest.spyOn(console, 'error').mockImplementation(() => {})
    jest.spyOn(console, 'log').mockImplementation(() => {})
  })

  afterEach(() => {
    jest.restoreAllMocks()
  })

  describe('extractSpreadsheetId', () => {
    it('should extract spreadsheet ID from full URL', () => {
      const url = 'https://docs.google.com/spreadsheets/d/1lEo4nGMcbfcdw6PRIo59XCJhUplbIhqy/edit'
      const id = util.extractSpreadsheetId(url)

      expect(id).toBe('1lEo4nGMcbfcdw6PRIo59XCJhUplbIhqy')
    })

    it('should extract spreadsheet ID from URL with hash', () => {
      const url = 'https://docs.google.com/spreadsheets/d/1lEo4nGMcbfcdw6PRIo59XCJhUplbIhqy/edit#gid=0'
      const id = util.extractSpreadsheetId(url)

      expect(id).toBe('1lEo4nGMcbfcdw6PRIo59XCJhUplbIhqy')
    })

    it('should throw error for invalid URL format', () => {
      const url = 'https://google.com'

      expect(() => util.extractSpreadsheetId(url)).toThrow('Invalid Google Sheets URL format')
    })

    it('should throw error for URL without spreadsheets/d/', () => {
      const url = 'https://docs.google.com/document/d/1abc'

      expect(() => util.extractSpreadsheetId(url)).toThrow('Invalid Google Sheets URL format')
    })
  })

  describe('convertToXlsxUrl', () => {
    it('should convert full Google Sheets URL to XLSX export URL', () => {
      const url = 'https://docs.google.com/spreadsheets/d/1lEo4nGMcbfcdw6PRIo59XCJhUplbIhqy/edit'
      const result = util.convertToXlsxUrl(url)

      expect(result).toBe('https://docs.google.com/spreadsheets/d/1lEo4nGMcbfcdw6PRIo59XCJhUplbIhqy/export?format=xlsx')
    })

    it('should convert spreadsheet ID directly to XLSX export URL', () => {
      const id = '1lEo4nGMcbfcdw6PRIo59XCJhUplbIhqy'
      const result = util.convertToXlsxUrl(id)

      expect(result).toBe('https://docs.google.com/spreadsheets/d/1lEo4nGMcbfcdw6PRIo59XCJhUplbIhqy/export?format=xlsx')
    })

    it('should handle URL with query parameters', () => {
      const url = 'https://docs.google.com/spreadsheets/d/1lEo4nGMcbfcdw6PRIo59XCJhUplbIhqy/edit?usp=sharing'
      const result = util.convertToXlsxUrl(url)

      expect(result).toBe('https://docs.google.com/spreadsheets/d/1lEo4nGMcbfcdw6PRIo59XCJhUplbIhqy/export?format=xlsx')
    })
  })

  describe('fetchExcelFile', () => {
    it('should fetch excel file successfully from Google Sheets', async () => {
      const fakeBuffer = new ArrayBuffer(8)
      global.fetch.mockResolvedValueOnce({
        ok: true,
        status: 200,
        arrayBuffer: jest.fn().mockResolvedValue(fakeBuffer),
      })

      const url = 'https://docs.google.com/spreadsheets/d/1lEo4nGMcbfcdw6PRIo59XCJhUplbIhqy/edit'
      const buffer = await util.fetchExcelFile(url)

      expect(fetch).toHaveBeenCalledWith(expect.stringContaining('/api/google-sheets-file?url='))
      expect(buffer).toBe(fakeBuffer)
    })

    it('should fetch excel file using spreadsheet ID directly', async () => {
      const fakeBuffer = new ArrayBuffer(8)
      global.fetch.mockResolvedValueOnce({
        ok: true,
        status: 200,
        arrayBuffer: jest.fn().mockResolvedValue(fakeBuffer),
      })

      const id = '1lEo4nGMcbfcdw6PRIo59XCJhUplbIhqy'
      const buffer = await util.fetchExcelFile(id)

      expect(fetch).toHaveBeenCalledWith(expect.stringContaining('/api/google-sheets-file?url='))
      expect(buffer).toBe(fakeBuffer)
    })

    it('should throw error when response not ok', async () => {
      global.fetch.mockResolvedValueOnce({
        ok: false,
        status: 403,
        statusText: 'Forbidden',
      })

      const url = 'https://docs.google.com/spreadsheets/d/1lEo4nGMcbfcdw6PRIo59XCJhUplbIhqy/edit'

      await expect(util.fetchExcelFile(url)).rejects.toThrow('Google Sheets fetch error')
    })

    it('should throw error when fetch throws', async () => {
      global.fetch.mockRejectedValueOnce(new Error('Network error'))

      const url = 'https://docs.google.com/spreadsheets/d/1lEo4nGMcbfcdw6PRIo59XCJhUplbIhqy/edit'

      await expect(util.fetchExcelFile(url)).rejects.toThrow('Google Sheets fetch error')
    })

    it('should throw error for invalid URL format', async () => {
      const url = 'https://google.com'

      await expect(util.fetchExcelFile(url)).rejects.toThrow('Google Sheets fetch error')
    })
  })

  describe('isValidGoogleSheetsUrl', () => {
    it('should return true for valid full Google Sheets URL', () => {
      const url = 'https://docs.google.com/spreadsheets/d/1lEo4nGMcbfcdw6PRIo59XCJhUplbIhqy/edit'
      expect(util.isValidGoogleSheetsUrl(url)).toBe(true)
    })

    it('should return true for valid spreadsheet ID (20+ alphanumeric chars)', () => {
      const id = '1lEo4nGMcbfcdw6PRIo59XCJhUplbIhqy'
      expect(util.isValidGoogleSheetsUrl(id)).toBe(true)
    })

    it('should return true for spreadsheet ID with hyphens and underscores', () => {
      const id = '1_lEo4nGMcbfcd-w6PRIo-59XCJhUplbIhqy'
      expect(util.isValidGoogleSheetsUrl(id)).toBe(true)
    })

    it('should return false for invalid Google Sheets URL', () => {
      const url = 'https://google.com'
      expect(util.isValidGoogleSheetsUrl(url)).toBe(false)
    })

    it('should return false for short invalid ID (less than 20 chars)', () => {
      const id = 'short'
      expect(util.isValidGoogleSheetsUrl(id)).toBe(false)
    })
  })
})
