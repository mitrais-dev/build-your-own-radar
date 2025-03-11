require('./common')
require('./images/logo.png')
require('./images/radar_legend.png')
require('./analytics.js')

const Factory = require('./util/factory')

if(!window.location.search) {
  window.location.href = window.location.origin + '?documentId=radar.xlsx'
}

Factory().build()
