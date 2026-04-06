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
    delete process.env.USE_CORS_PROXY
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
    const allOriginsBaseUrl = 'api.allorigins.win/raw?url='

    it('should fetch excel file successfully from Google Sheets', async () => {
      const fakeBuffer = new ArrayBuffer(8)
      global.fetch.mockResolvedValueOnce({
        ok: true,
        status: 200,
        arrayBuffer: jest.fn().mockResolvedValue(fakeBuffer),
      })

      const url = 'https://docs.google.com/spreadsheets/d/1lEo4nGMcbfcdw6PRIo59XCJhUplbIhqy/edit'
      const buffer = await util.fetchExcelFile(url)

      expect(fetch).toHaveBeenCalledWith(expect.stringContaining(allOriginsBaseUrl), expect.any(Object))
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

      expect(fetch).toHaveBeenCalledWith(expect.stringContaining(allOriginsBaseUrl), expect.any(Object))
      expect(buffer).toBe(fakeBuffer)
    })

    it('should fetch directly when USE_CORS_PROXY=false', async () => {
      process.env.USE_CORS_PROXY = 'false'
      util = new GoogleSheetsUtil()

      const fakeBuffer = new ArrayBuffer(8)
      global.fetch.mockResolvedValueOnce({
        ok: true,
        status: 200,
        arrayBuffer: jest.fn().mockResolvedValue(fakeBuffer),
      })

      const id = '1lEo4nGMcbfcdw6PRIo59XCJhUplbIhqy'
      const expectedDirectUrl = `https://docs.google.com/spreadsheets/d/${id}/export?format=xlsx`
      const buffer = await util.fetchExcelFile(id)

      expect(fetch).toHaveBeenCalledWith(expectedDirectUrl)
      expect(buffer).toBe(fakeBuffer)
      delete process.env.USE_CORS_PROXY
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

    it('should return false when docs.google.com/spreadsheets only appears in query string', () => {
      const url = 'https://evil.com/?next=https://docs.google.com/spreadsheets/d/1lEo4nGMcbfcdw6PRIo59XCJhUplbIhqy/edit'
      expect(util.isValidGoogleSheetsUrl(url)).toBe(false)
    })

    it('should return false for attacker-controlled lookalike hostname', () => {
      const url = 'https://docs.google.com.evil.com/spreadsheets/d/1lEo4nGMcbfcdw6PRIo59XCJhUplbIhqy/edit'
      expect(util.isValidGoogleSheetsUrl(url)).toBe(false)
    })

    it('should return false for docs.google.com with non-spreadsheet path', () => {
      const url = 'https://docs.google.com/document/d/1lEo4nGMcbfcdw6PRIo59XCJhUplbIhqy/edit'
      expect(util.isValidGoogleSheetsUrl(url)).toBe(false)
    })

    it('should return false for short invalid ID (less than 20 chars)', () => {
      const id = 'short'
      expect(util.isValidGoogleSheetsUrl(id)).toBe(false)
    })
  })
})
