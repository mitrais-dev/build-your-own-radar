const CorsProxyUtil = require('../../src/util/corsProxy')

describe('CorsProxyUtil', () => {
  let util

  beforeEach(() => {
    util = new CorsProxyUtil()
    global.fetch = jest.fn()
    jest.spyOn(console, 'error').mockImplementation(() => {})
    jest.spyOn(console, 'log').mockImplementation(() => {})
  })

  afterEach(() => {
    jest.restoreAllMocks()
  })

  describe('getProxyUrl', () => {
    it('should fallback to default proxy when env proxy name is invalid', () => {
      process.env.CORS_PROXY = 'unknown-proxy'

      const utilWithInvalidProxy = new CorsProxyUtil()
      const proxyUrl = utilWithInvalidProxy.getProxyUrl()

      expect(proxyUrl).toBe('https://api.allorigins.win/raw?url=')

      delete process.env.CORS_PROXY
    })
  })

  describe('fetchThroughProxy', () => {
    it('should build correct proxy URL with encoded target URL', async () => {
      global.fetch.mockResolvedValueOnce({
        ok: true,
        status: 200,
      })

      const targetUrl = 'https://docs.google.com/spreadsheets/d/123/export?format=xlsx'
      await util.fetchThroughProxy(targetUrl)

      expect(fetch).toHaveBeenCalledWith(
        expect.stringContaining('api.allorigins.win/raw?url=https%3A%2F%2Fdocs.google.com'),
        expect.any(Object),
      )
    })

    it('should use corsanywhere proxy when specified in env', async () => {
      process.env.CORS_PROXY = 'corsanywhere'
      const utilWithCorsanywhere = new CorsProxyUtil()

      global.fetch.mockResolvedValueOnce({
        ok: true,
        status: 200,
      })

      const targetUrl = 'https://docs.google.com/spreadsheets/d/123/export?format=xlsx'
      await utilWithCorsanywhere.fetchThroughProxy(targetUrl)

      expect(fetch.mock.calls[0][0]).toContain('https://cors-anywhere.herokuapp.com/')

      delete process.env.CORS_PROXY
    })

    it('should retry with next proxy when response is not ok', async () => {
      global.fetch.mockResolvedValue({
        ok: false,
        status: 503,
        statusText: 'Service Unavailable',
      })

      const targetUrl = 'https://docs.google.com/spreadsheets/d/123/export?format=xlsx'

      await expect(util.fetchThroughProxy(targetUrl)).rejects.toThrow('CORS Proxy fetch failed')

      expect(console.error).toHaveBeenCalledWith('[CORSProxy] Error:', expect.any(Error))
      expect(fetch).toHaveBeenCalledTimes(5)
    })
  })
})
