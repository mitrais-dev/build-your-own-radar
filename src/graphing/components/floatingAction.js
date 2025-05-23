const { constructSheetUrl } = require('../../util/urlUtils')

function renderFloatingActionButton(alternatives, currentSheet) {
  const style = document.createElement('style')
  document.head.appendChild(style)

  // --- FLOATING BUTTONS ---
  const buttonsContainer = document.createElement('div')
  buttonsContainer.className = 'floating-buttons'

  const createButton = (iconSrc, tooltipText, id) => {
    const btn = document.createElement('button')
    btn.className = 'floating-button'
    btn.id = id

    const tooltip = document.createElement('div')
    tooltip.className = 'tooltip'
    tooltip.textContent = tooltipText

    const image = document.createElement('img')
    image.src = iconSrc
    image.alt = tooltipText
    image.style.width = '40px'

    btn.appendChild(tooltip)
    btn.appendChild(image)
    return btn
  }

  const printBtn = createButton(
    'data:image/png;base64,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',
    'Print This Radar',
    'printBtn',
  )
  const archiveBtn = createButton(
    'data:image/png;base64,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',
    'Archive',
    'archiveBtn',
  )

  buttonsContainer.appendChild(printBtn)
  buttonsContainer.appendChild(archiveBtn)
  document.body.appendChild(buttonsContainer)

  // --- ARCHIVE PANEL ---
  const archivePanel = document.createElement('div')
  archivePanel.className = 'archive-panel'
  archivePanel.id = 'archivePanel'

  const archiveList = document.createElement('div')
  archiveList.id = 'archiveList'

  const loader = document.createElement('div')
  loader.id = 'loader'
  loader.textContent = 'Loading more...'

  archivePanel.appendChild(archiveList)
  archivePanel.appendChild(loader)
  document.body.appendChild(archivePanel)

  // --- FUNCTIONALITY ---
  const rest = [...alternatives].filter((item) => item !== currentSheet)
  let isOpen = false
  let itemCount = 0
  const BATCH_SIZE = 5
  const MAX_ITEMS = rest.length

  const loadMoreItems = () => {
    if (itemCount >= MAX_ITEMS) {
      loader.textContent = 'No more items.'
      return
    }

    for (let i = 0; i < BATCH_SIZE && itemCount < MAX_ITEMS; i++) {
      const div = document.createElement('div')
      div.className = 'archive-item'

      const archiveLink = document.createElement('a')
      archiveLink.className = 'archive-item__link'
      archiveLink.textContent = rest[itemCount]
      archiveLink.href = constructSheetUrl(rest[itemCount])
      archiveLink.setAttribute('role', 'tab')
      archiveLink.style.borderBottom = 'none'
      div.appendChild(archiveLink)

      const tooltip = document.createElement('div')
      tooltip.className = 'archive-item__tooltip'
      tooltip.textContent = 'Show this radar'

      div.appendChild(tooltip)
      archiveList.appendChild(div)

      itemCount++
    }
  }

  archiveBtn.addEventListener('click', () => {
    isOpen = !isOpen
    archivePanel.style.display = isOpen ? 'flex' : 'none'
    if (isOpen && archiveList.children.length === 0) {
      loadMoreItems()
    }
  })

  archivePanel.addEventListener('scroll', () => {
    if (archivePanel.scrollTop + archivePanel.clientHeight >= archivePanel.scrollHeight - 10) {
      loadMoreItems()
    }
  })

  document.addEventListener('click', (event) => {
    if (!archivePanel.contains(event.target) && !archiveBtn.contains(event.target)) {
      isOpen = false
      archivePanel.style.display = 'none'
    }
  })

  printBtn.addEventListener('click', () => {
    window.print()
  })
}

module.exports = { renderFloatingActionButton }
