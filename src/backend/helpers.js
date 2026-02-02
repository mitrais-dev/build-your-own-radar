const ValidationError = require('../exceptions/validationError')

/**
 * Send common error response
 */
const sendError = (res, statusCode, errorType, message) => {
  console.error(`${errorType} error:`, message)
  res.status(statusCode).json({
    error: errorType,
    message: message,
  })
}

/**
 * Send file response with proper headers
 */
const sendFileResponse = (
  res,
  buffer,
  contentType = 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
) => {
  console.log(`✓ Got buffer, size: ${buffer.byteLength} bytes`)
  res.setHeader('Content-Type', contentType)
  res.send(Buffer.from(buffer))
}

/**
 * Validate XLSX file by magic bytes (PK zip format)
 * Throws error if file is not valid XLSX
 */
const validateXlsxBuffer = (buffer) => {
  const uint8 = new Uint8Array(buffer)
  const isValid = uint8[0] === 0x50 && uint8[1] === 0x4b // PK magic bytes

  if (!isValid) {
    const firstBytes = Array.from(uint8.slice(0, 4))
      .map((b) => b.toString(16))
      .join(' ')
    const text = new TextDecoder().decode(uint8.slice(0, 200))

    console.error(`⚠ Buffer does NOT look like XLSX file! First bytes: ${firstBytes}`)
    console.error('First 200 chars:', text)

    throw new ValidationError('Invalid file format: Expected XLSX file')
  }

  console.log('✓ Buffer looks like valid XLSX')

  return true
}

module.exports = {
  sendError,
  sendFileResponse,
  validateXlsxBuffer,
}
