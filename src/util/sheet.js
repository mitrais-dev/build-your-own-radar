const SheetNotFoundError = require('../../src/exceptions/sheetNotFoundError')
const ExceptionMessages = require('./exceptionMessages')
const config = require('../config')
const X = require('xlsx')

const Sheet = function (sheetReference) {
  var self = {}
  var dataFetcher
  const featureToggles = config().featureToggles

  ;(function () {
    var matches = sheetReference.match('https:\\/\\/docs.google.com\\/spreadsheets\\/d\\/(.*?)($|\\/$|\\/.*|\\?.*)')
    self.id = matches !== null ? matches[1] : sheetReference
  })()

  self.validate = function (callback) {
    var apiKeyEnabled = process.env.API_KEY || false
    var targetURL = 'https://docs.google.com/spreadsheets/d/' + self.id

    // TODO: Move this out (as HTTPClient)
    var xhr = new XMLHttpRequest()
    xhr.open('GET', targetURL, true)
    xhr.onreadystatechange = function () {
      if (xhr.readyState === 4) {
        if (xhr.status === 200) {
          return callback(null, apiKeyEnabled)
        } else if (xhr.status === 404) {
          return callback(self.createSheetNotFoundError(), apiKeyEnabled)
        } else {
          return callback(null, apiKeyEnabled)
        }
      }
    }
    xhr.send(null)
  }

  async function tryGetPublicSheetResponse() {
    try {
      const publicExportUrl = 'https://docs.google.com/spreadsheets/d/' + self.id + '/export?format=xlsx'
      const response = await fetch(publicExportUrl)

      if (!response.ok) {
        return null
      }

      const workbookBuffer = await response.arrayBuffer()
      const workbook = X.read(workbookBuffer, { type: 'array' })

      if (!workbook.SheetNames || workbook.SheetNames.length === 0) {
        return null
      }

      dataFetcher = function (range) {
        const sheetName = range.split('!')[0]
        const worksheet = workbook.Sheets[sheetName]

        if (!worksheet) {
          return Promise.reject(self.createSheetNotFoundError())
        }

        return Promise.resolve({
          result: {
            values: X.utils.sheet_to_json(worksheet, { header: 1, raw: false }),
          },
        })
      }

      return {
        status: 200,
        result: {
          properties: {
            title: (workbook.Props && workbook.Props.Title) || 'Google Sheet',
          },
          sheets: workbook.SheetNames.map((sheetTitle) => ({
            properties: { title: sheetTitle },
          })),
        },
      }
    } catch (_error) {
      return null
    }
  }

  self.createSheetNotFoundError = function () {
    const exceptionMessage = featureToggles.UIRefresh2022
      ? ExceptionMessages.SHEET_NOT_FOUND_NEW
      : ExceptionMessages.SHEET_NOT_FOUND
    return new SheetNotFoundError(exceptionMessage)
  }

  self.getSheet = async function () {
    const publicSheetResponse = await tryGetPublicSheetResponse()
    if (publicSheetResponse) {
      self.sheetResponse = publicSheetResponse
      return
    }

    self.sheetResponse = { status: 403 }
  }

  self.getData = function (range) {
    return dataFetcher(range)
  }

  self.processSheetResponse = async function (sheetName, createBlips, handleError) {
    return self.sheetResponse.status !== 200
      ? handleError(self.sheetResponse)
      : processSheetData(sheetName, createBlips, handleError)
  }

  function processSheetData(sheetName, createBlips, handleError) {
    const sheetNames = self.sheetResponse.result.sheets.map((s) => s.properties.title)
    sheetName = !sheetName ? sheetNames[0] : sheetName
    self
      .getData(sheetName + '!A1:F')
      .then((r) => createBlips(self.sheetResponse.result.properties.title, r.result.values, sheetNames))
      .catch(handleError)
  }

  return self
}

module.exports = Sheet
