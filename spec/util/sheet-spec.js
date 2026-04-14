const Sheet = require('../../src/util/sheet')
const config = require('../../src/config')
const X = require('xlsx')

jest.mock('../../src/config')
describe('sheet', function () {
  const oldEnv = process.env
  beforeEach(() => {
    config.mockReturnValue({ featureToggles: { UIRefresh2022: true } })
    process.env.API_KEY = 'API_KEY'
  })

  afterEach(() => {
    jest.clearAllMocks()
    process.env = oldEnv
    delete global.fetch
  })

  it('knows to find the sheet id from published URL', function () {
    const sheet = new Sheet('https://docs.google.com/spreadsheets/d/sheetId/pubhtml')

    expect(sheet.id).toEqual('sheetId')
  })

  it('knows to find the sheet id from publicly shared URL having query params', function () {
    const sheet = new Sheet('https://docs.google.com/spreadsheets/d/sheetId?abc=xyz')

    expect(sheet.id).toEqual('sheetId')
  })

  it('knows to find the sheet id from publicly shared URL having extra path and query params', function () {
    const sheet = new Sheet('https://docs.google.com/spreadsheets/d/sheetId/edit?usp=sharing')

    expect(sheet.id).toEqual('sheetId')
  })

  it('knows to find the sheet id from publicly shared URL having no extra path or query params', function () {
    const sheet = new Sheet('https://docs.google.com/spreadsheets/d/sheetId')

    expect(sheet.id).toEqual('sheetId')
  })

  it('knows to find the sheet id from publicly shared URL with trailing slash', function () {
    const sheet = new Sheet('https://docs.google.com/spreadsheets/d/sheetId/')

    expect(sheet.id).toEqual('sheetId')
  })

  it('can identify a plain sheet ID', function () {
    const sheet = new Sheet('sheetId')

    expect(sheet.id).toEqual('sheetId')
  })

  it('calls back with nothing if the sheet exists', () => {
    const mockCallback = jest.fn()
    const xhrMock = { open: jest.fn(), send: jest.fn(), readyState: 4, status: 200, response: 'response' }
    jest.spyOn(window, 'XMLHttpRequest').mockImplementation(() => xhrMock)

    const sheet = new Sheet('http://example.com/a/b/c/d/?x=y')
    sheet.validate(mockCallback)
    xhrMock.onreadystatechange(new Event(''))

    expect(xhrMock.open).toHaveBeenCalledTimes(1)
    expect(xhrMock.open).toHaveBeenCalledWith(
      'GET',
      'http://localhost:8787/proxy?url=https%3A%2F%2Fdocs.google.com%2Fspreadsheets%2Fd%2Fhttp%3A%2F%2Fexample.com%2Fa%2Fb%2Fc%2Fd%2F%3Fx%3Dy',
      true,
    )
    expect(xhrMock.send).toHaveBeenCalledTimes(1)
    expect(xhrMock.send).toHaveBeenCalledWith(null)
    expect(mockCallback).toHaveBeenCalledTimes(1)
    expect(mockCallback).toHaveBeenCalledWith(null, 'API_KEY')
  })

  it('calls back with nothing for non-404 validation response', function () {
    const mockCallback = jest.fn()
    const xhrMock = { open: jest.fn(), send: jest.fn(), readyState: 4, status: 401, response: 'response' }
    jest.spyOn(window, 'XMLHttpRequest').mockImplementation(() => xhrMock)

    const sheet = new Sheet('http://example.com/a/b/c/d/?x=y')
    sheet.validate(mockCallback)
    xhrMock.onreadystatechange(new Event(''))

    expect(xhrMock.open).toHaveBeenCalledTimes(1)
    expect(xhrMock.open).toHaveBeenCalledWith(
      'GET',
      'http://localhost:8787/proxy?url=https%3A%2F%2Fdocs.google.com%2Fspreadsheets%2Fd%2Fhttp%3A%2F%2Fexample.com%2Fa%2Fb%2Fc%2Fd%2F%3Fx%3Dy',
      true,
    )
    expect(xhrMock.send).toHaveBeenCalledTimes(1)
    expect(xhrMock.send).toHaveBeenCalledWith(null)
    expect(mockCallback).toHaveBeenCalledTimes(1)
    expect(mockCallback).toHaveBeenCalledWith(null, 'API_KEY')
  })

  it('should give the sheet not found error with new message', () => {
    const errorMessage = 'Oops! We can’t find the Google Sheet you’ve entered, please check the URL of your sheet.'
    const mockCallback = jest.fn()
    const xhrMock = { open: jest.fn(), send: jest.fn(), readyState: 4, status: 404, response: 'response' }
    jest.spyOn(window, 'XMLHttpRequest').mockImplementation(() => xhrMock)

    const sheet = new Sheet('http://example.com/a/b/c/d/?x=y')
    sheet.validate(mockCallback)
    xhrMock.onreadystatechange(new Event(''))

    expect(xhrMock.open).toHaveBeenCalledTimes(1)
    expect(xhrMock.open).toHaveBeenCalledWith(
      'GET',
      'http://localhost:8787/proxy?url=https%3A%2F%2Fdocs.google.com%2Fspreadsheets%2Fd%2Fhttp%3A%2F%2Fexample.com%2Fa%2Fb%2Fc%2Fd%2F%3Fx%3Dy',
      true,
    )
    expect(xhrMock.send).toHaveBeenCalledTimes(1)
    expect(xhrMock.send).toHaveBeenCalledWith(null)
    expect(mockCallback).toHaveBeenCalledTimes(1)
    expect(mockCallback).toHaveBeenCalledWith({ message: errorMessage }, 'API_KEY')
  })

  it('should give the sheet not found error with old message', () => {
    const errorMessage = 'Oops! We can’t find the Google Sheet you’ve entered. Can you check the URL?'
    const mockCallback = jest.fn()
    const xhrMock = { open: jest.fn(), send: jest.fn(), readyState: 4, status: 404, response: 'response' }
    jest.spyOn(window, 'XMLHttpRequest').mockImplementation(() => xhrMock)
    config.mockReturnValue({ featureToggles: { UIRefresh2022: false } })

    const sheet = new Sheet('http://example.com/a/b/c/d/?x=y')
    sheet.validate(mockCallback)
    xhrMock.onreadystatechange(new Event(''))

    expect(xhrMock.open).toHaveBeenCalledTimes(1)
    expect(xhrMock.open).toHaveBeenCalledWith(
      'GET',
      'http://localhost:8787/proxy?url=https%3A%2F%2Fdocs.google.com%2Fspreadsheets%2Fd%2Fhttp%3A%2F%2Fexample.com%2Fa%2Fb%2Fc%2Fd%2F%3Fx%3Dy',
      true,
    )
    expect(xhrMock.send).toHaveBeenCalledTimes(1)
    expect(xhrMock.send).toHaveBeenCalledWith(null)
    expect(mockCallback).toHaveBeenCalledTimes(1)
    expect(mockCallback).toHaveBeenCalledWith({ message: errorMessage }, 'API_KEY')
  })

  it('fetches public sheet via local proxy before oauth flow', async () => {
    const workbook = X.utils.book_new()
    const worksheet = X.utils.aoa_to_sheet([
      ['name', 'ring', 'quadrant', 'isNew', 'description', 'url'],
      ['alpha', 'adopt', 'tools', 'TRUE', 'desc', 'https://example.com'],
    ])
    X.utils.book_append_sheet(workbook, worksheet, 'Radar')
    const workbookBuffer = X.write(workbook, { type: 'array', bookType: 'xlsx' })

    global.fetch = jest.fn().mockResolvedValue({
      ok: true,
      status: 200,
      arrayBuffer: jest.fn().mockResolvedValue(workbookBuffer),
    })

    const sheet = new Sheet('sheetId')
    await sheet.getSheet()

    expect(fetch).toHaveBeenCalledWith(
      'http://localhost:8787/proxy?url=https%3A%2F%2Fdocs.google.com%2Fspreadsheets%2Fd%2FsheetId%2Fexport%3Fformat%3Dxlsx',
    )

    const data = await sheet.getData('Radar!A1:F')
    expect(data.result.values[1][0]).toEqual('alpha')
  })

  it('returns forbidden response when public fetch via local proxy fails', async () => {
    global.fetch = jest.fn().mockRejectedValue(new Error('proxy unavailable'))

    const sheet = new Sheet('sheetId')
    await sheet.getSheet()

    expect(sheet.sheetResponse.status).toBe(403)
  })
})
