const request = require('supertest')
const app = require('../src/backend')

const mockGet = jest.fn()

jest.mock('axios', () => ({
  create: jest.fn(() => ({
    get: mockGet,
  })),
}))
jest.mock('axios-cookiejar-support', () => ({
  wrapper: jest.fn(),
}))
describe('Backend', () => {
  describe('GET /api/proxy', () => {
    let consoleErrorSpy
    const url = 'https%3A%2F%2Ftest.com'

    beforeEach(() => {
      consoleErrorSpy = jest.spyOn(console, 'error').mockImplementation(() => {})
    })

    afterEach(() => {
      consoleErrorSpy.mockRestore()
    })

    it('should return status 200 if success', async () => {
      const fakeBuffer = Buffer.from([0x50, 0x4b])

      mockGet.mockResolvedValueOnce({
        status: 200,
        data: fakeBuffer,
      })

      const res = await request(app).get(`/api/proxy?url=${url}`)

      expect(res.status).toBe(200)
    })

    it('should return status 400 when url is undefined', async () => {
      const res = await request(app).get('/api/proxy')

      expect(res.status).toBe(400)
    })

    it('should log error when buffer is not XLSX', async () => {
      const fakeHtmlBuffer = Buffer.from('<html>Error</html>')
      mockGet.mockResolvedValueOnce({
        status: 200,
        data: fakeHtmlBuffer,
      })

      const res = await request(app).get(`/api/proxy?url=${url}`)

      expect(res.status).toBe(200)
      expect(consoleErrorSpy).toHaveBeenCalled()
      expect(consoleErrorSpy).toHaveBeenCalledWith('⚠ WARNING: Buffer does NOT look like XLSX file!')
    })

    it('should return 500 when axios throws error', async () => {
      mockGet.mockRejectedValueOnce(new Error('Network error'))

      const res = await request(app).get(`/api/proxy?url=${url}`)

      expect(res.status).toBe(500)
      expect(res.body).toEqual({
        error: 'Proxy error',
        message: 'Network error',
      })
    })
  })

  describe('GET /health', () => {
    it('should return health status', async () => {
      const res = await request(app).get('/health')

      expect(res.status).toBe(200)
      expect(res.body).toEqual({
        status: 'OK',
        service: 'OneDrive Proxy Server',
      })
    })
  })
})
