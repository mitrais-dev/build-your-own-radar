const OneDriveUtil = require('../../src/util/oneDriveUtil')

describe('OneDriveUtil', () => {
  let util

  beforeEach(() => {
    util = OneDriveUtil()
    global.fetch = jest.fn()
    //jest.spyOn(console, 'log').mockImplementation(() => {})
    jest.spyOn(console, 'error').mockImplementation(() => {})
  })

  afterEach(() => {
    jest.restoreAllMocks()
  })

  describe('convertToDirectUrl', () => {
    it('should add download=1 for sharepoint url', () => {
      const url = 'https://company.sharepoint.com/file.xlsx'
      const result = util.convertToDirectUrl(url)

      expect(result).toBe(url + '?download=1')
    })

    it('should append &download=1 if sharepoint has query', () => {
      const url = 'https://company.sharepoint.com/file.xlsx?foo=bar'
      const result = util.convertToDirectUrl(url)

      expect(result).toBe(url + '&download=1')
    })

    it('should convert 1drv.ms short url', () => {
      const url = 'https://1drv.ms/x/s!ABC'
      expect(util.convertToDirectUrl(url)).toBe(url + '?download=1')
    })

    it('should throw error for invalid url', () => {
      expect(() => util.convertToDirectUrl('https://google.com')).toThrow('Invalid OneDrive URL')
    })

    it('should convert full OneDrive URL with resid to api download url', () => {
      const url = 'https://onedrive.live.com/?resid=ABC123%21DEF456'

      const result = util.convertToDirectUrl(url)

      expect(result).toBe('https://api.onedrive.com/v1.0/drives/me/items/ABC123%21DEF456/content')
    })

    it('should return download URL when rId parameter is present', () => {
      const url = 'https://onedrive.live.com/?rId=ABC123%21DEF456'

      const result = util.convertToDirectUrl(url)

      expect(result).toBe('https://onedrive.live.com/?download=1')
    })

    it('should append ?download=1 when no resid or rId is present', () => {
      const url = 'https://onedrive.live.com/?cid=1234567890ABCDEF'

      const result = util.convertToDirectUrl(url)

      expect(result).toBe('https://onedrive.live.com/?download=1')
    })
  })

  describe('fetchExcelFile', () => {
    const allOriginsBaseUrl = 'api.allorigins.win/raw?url='

    it('should fetch excel file successfully', async () => {
      const fakeBuffer = new ArrayBuffer(8)
      global.fetch.mockResolvedValueOnce({
        ok: true,
        status: 200,
        arrayBuffer: jest.fn().mockResolvedValue(fakeBuffer),
      })

      const buffer = await util.fetchExcelFile('https://1drv.ms/x/s!ABC')

      expect(fetch).toHaveBeenCalled()
      expect(buffer).toBe(fakeBuffer)
    })

    it('should use proxy for sharepoint urls', async () => {
      const fakeBuffer = new ArrayBuffer(8)
      global.fetch.mockResolvedValueOnce({
        ok: true,
        status: 200,
        arrayBuffer: jest.fn().mockResolvedValue(fakeBuffer),
      })

      await util.fetchExcelFile('https://company.sharepoint.com/file.xlsx')

      expect(fetch).toHaveBeenCalledWith(expect.stringContaining(allOriginsBaseUrl), expect.any(Object))
    })

    it('should throw error when response not ok', async () => {
      global.fetch.mockResolvedValueOnce({
        ok: false,
        status: 403,
        statusText: 'Forbidden',
      })

      await expect(util.fetchExcelFile('https://1drv.ms/x/s!ABC')).rejects.toThrow('OneDrive fetch error')
    })

    it('should throw error when fetch throws', async () => {
      global.fetch.mockRejectedValueOnce(new Error('Network error'))

      await expect(util.fetchExcelFile('https://1drv.ms/x/s!ABC')).rejects.toThrow('OneDrive fetch error')
    })
  })

  describe('isValidOneDriveUrl', () => {
    it('should return true for valid onedrive url', () => {
      expect(util.isValidOneDriveUrl('https://onedrive.live.com')).toBe(true)
    })

    it('should return false for invalid url', () => {
      expect(util.isValidOneDriveUrl('https://google.com')).toBe(false)
    })
  })
})
