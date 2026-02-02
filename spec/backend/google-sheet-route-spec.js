const axios = require('axios')
const request = require('supertest')

const app = require('../../src/backend/index')

jest.mock('axios', () => ({
  get: jest.fn(),
}))

describe('Backend', () => {
  describe('GET /api/google-sheets-file', () => {
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

      axios.get.mockResolvedValueOnce({
        status: 200,
        data: fakeBuffer,
      })

      const res = await request(app).get(`/api/google-sheets-file?url=${url}`)

      expect(res.status).toBe(200)
    })

    it('should return status 400 when url is undefined', async () => {
      const res = await request(app).get('/api/google-sheets-file')

      expect(res.status).toBe(400)
    })

    it('should log error when buffer is not XLSX', async () => {
      const fakeHtmlBuffer = Buffer.from('<html>Error</html>')
      axios.get.mockResolvedValueOnce({
        status: 200,
        data: fakeHtmlBuffer,
      })

      const res = await request(app).get(`/api/google-sheets-file?url=${url}`)

      expect(res.status).toBe(400)
      expect(consoleErrorSpy).toHaveBeenCalled()
    })

    it('should return 500 when axios throws error', async () => {
      axios.get.mockRejectedValueOnce(new Error('Network error'))

      const res = await request(app).get(`/api/google-sheets-file?url=${url}`)

      expect(res.status).toBe(500)
      expect(res.body).toEqual({
        error: 'Google Sheets Proxy Error',
        message: 'Network error',
      })
    })
  })
})
