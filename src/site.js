require('./common')
require('./images/logo.png')
require('./images/radar_legend.png')
require('./analytics.js')

const Factory = require('./util/factory')

// Only redirect to default if no query params AND no default URL is configured
if (!window.location.search) {
  const defaultRadarUrl = process.env.RADAR_DATA_URL

  // If there's a default URL configured, don't redirect - let factory handle it
  // Otherwise redirect to default radar.xlsx
  if (!defaultRadarUrl) {
    window.location.href = window.location.origin + '?documentId=radar.xlsx'
  }
}

Factory().build()
