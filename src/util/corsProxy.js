/**
 * CORS Proxy Utility
 * Uses free public CORS proxy to bypass CORS restrictions
 * Currently using api.allorigins.win which is reliable and free
 */

const CORSProxy = function () {
  var self = {}

  // Free CORS proxy endpoints
  const PROXY_OPTIONS = [
    {
      name: 'allorigins',
      url: 'https://api.allorigins.win/raw?url=',
      description: 'Reliable and fast',
    },
    {
      name: 'corsproxy',
      url: 'https://corsproxy.io/?',
      description: 'Simple proxy for binary files',
    },
    {
      name: 'thingproxy',
      url: 'https://thingproxy.freeboard.io/fetch/',
      description: 'Alternative proxy for downloads',
    },
    {
      name: 'corsanywhere',
      url: 'https://cors-anywhere.herokuapp.com/',
      description: 'Popular but may have rate limits',
    },
    {
      name: 'corsninja',
      url: 'https://corsninja.vercel.app/?url=',
      description: 'Alternative option',
    },
  ]

  /**
   * Get the active CORS proxy URL
   * Default to allorigins which is most reliable
   * @returns {string} Proxy base URL
   */
  self.getProxyUrl = function () {
    const selectedProxy = process.env.CORS_PROXY || 'allorigins'
    const proxy = PROXY_OPTIONS.find((p) => p.name === selectedProxy)
    return proxy ? proxy.url : PROXY_OPTIONS[0].url
  }

  function getProxyCandidates() {
    const selectedProxyUrl = self.getProxyUrl()
    const selected = PROXY_OPTIONS.find((p) => p.url === selectedProxyUrl) || PROXY_OPTIONS[0]
    const rest = PROXY_OPTIONS.filter((p) => p.name !== selected.name)
    return [selected, ...rest]
  }

  function buildProxyUrl(proxyUrl, targetUrl) {
    if (proxyUrl.includes('allorigins')) {
      return proxyUrl + encodeURIComponent(targetUrl)
    }
    if (proxyUrl.includes('cors-anywhere')) {
      return proxyUrl + targetUrl
    }
    if (proxyUrl.includes('corsninja')) {
      return proxyUrl + encodeURIComponent(targetUrl)
    }
    return proxyUrl + encodeURIComponent(targetUrl)
  }

  /**
   * Fetch a URL through CORS proxy
   * @param {string} targetUrl - URL to fetch
   * @param {Object} options - Fetch options
   * @returns {Promise<Response>}
   */
  self.fetchThroughProxy = async function (targetUrl, options = {}) {
    const candidates = getProxyCandidates()
    let lastError = null

    for (let i = 0; i < candidates.length; i++) {
      const proxy = candidates[i]
      const proxyUrl = proxy.url
      const finalUrl = buildProxyUrl(proxyUrl, targetUrl)

      try {
        console.log(`[CORSProxy] Fetching through proxy: ${proxyUrl}`)
        console.log(`[CORSProxy] Target URL: ${targetUrl}`)

        const response = await fetch(finalUrl, {
          ...options,
          headers: {
            'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36',
            ...options.headers,
          },
        })

        if (response.ok) {
          return response
        }

        lastError = new Error(`HTTP ${response.status}: ${response.statusText}`)
        continue
      } catch (error) {
        lastError = error
        continue
      }
    }

    console.error('[CORSProxy] Error:', lastError)
    throw new Error(`CORS Proxy fetch failed: ${lastError ? lastError.message : 'Unknown error'}`)
  }

  return self
}

module.exports = CORSProxy
