const { constructSheetUrl } = require('../../util/urlUtils')

const createButton = (iconSrc, tooltipText, id, ms) => {
  const btn = document.createElement('button')
  btn.className = 'fab-action'
  btn.id = id
  btn.style.transitionDelay = ms

  const tooltip = document.createElement('div')
  tooltip.className = 'fab-action__tooltip'
  tooltip.textContent = tooltipText

  const image = document.createElement('img')
  image.src = iconSrc
  image.alt = tooltipText

  btn.appendChild(tooltip)
  btn.appendChild(image)
  return btn
}

function floatingActionButton(showBackToLatest) {
  // 1. Create the main fab-container div
  const fabContainer = document.createElement('div')
  fabContainer.id = 'fabContainer'
  fabContainer.classList.add('fab-container')

  // 2. Create the fab-actions div
  const fabActions = document.createElement('div')
  fabActions.id = 'fabActions'
  fabActions.classList.add('fab-actions')

  const printBtnMs = showBackToLatest ? '0.2s' : '0.1s'
  const archiveBtnMs = showBackToLatest ? '0.3s' : '0.2s'

  // 3. Create the fab-action elements and append them to fab-actions
  const backToLatestBtn = createButton('images/back.png', 'Back to Latest Radar', 'backToLatestBtn', '0.1s')
  const archiveBtn = createButton('images/archive.png', 'Archive', 'archiveBtn', archiveBtnMs)
  const printBtn = createButton('images/printer.png', 'Print This Radar', 'printBtn', printBtnMs)

  if (showBackToLatest) {
    fabActions.appendChild(backToLatestBtn)
  }
  fabActions.appendChild(printBtn)
  fabActions.appendChild(archiveBtn)

  // 4. Create the fab button
  const fabButton = document.createElement('button')
  fabButton.id = 'fab'
  fabButton.classList.add('fab')
  fabButton.setAttribute('aria-label', 'Floating Action Button')

  // 5. Create the fab-icon span and append to the button
  const fabIcon = document.createElement('span')
  fabIcon.classList.add('fab-icon')
  fabIcon.textContent = '+'

  const fabTooltip = document.createElement('div')
  fabTooltip.classList.add('fab__tooltip')
  fabTooltip.textContent = 'Open'

  fabButton.appendChild(fabIcon)
  fabButton.appendChild(fabTooltip)

  // Append actions and button to the container
  fabContainer.appendChild(fabActions)
  fabContainer.appendChild(fabButton)

  // Append the entire FAB structure to the body
  document.body.appendChild(fabContainer)

  return {
    printBtn,
    archiveBtn,
    backToLatestBtn,
  }
}

function arvhiveEventListener(archiveBtn, archiveItems) {
  // --- FUNCTIONALITY ---
  let isOpen = false
  let itemCount = 0
  const BATCH_SIZE = 5
  const MAX_ITEMS = archiveItems.length

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

  const loadMoreItems = () => {
    if (itemCount >= MAX_ITEMS) {
      loader.textContent = 'No more items.'
      return
    }

    for (let i = 0; i < BATCH_SIZE && itemCount < MAX_ITEMS; i++) {
      const archiveItemContainer = document.createElement('div')
      archiveItemContainer.className = 'archive-item'

      const archiveLink = document.createElement('a')
      archiveLink.className = 'archive-item__link'
      archiveLink.textContent = archiveItems[itemCount]
      archiveLink.href = constructSheetUrl(archiveItems[itemCount])
      archiveLink.setAttribute('role', 'tab')
      archiveLink.style.borderBottom = 'none'

      const tooltip = document.createElement('div')
      tooltip.className = 'archive-item__tooltip'
      tooltip.textContent = 'Show this radar'

      archiveLink.appendChild(tooltip)
      archiveItemContainer.appendChild(archiveLink)
      archiveList.appendChild(archiveItemContainer)

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
}

function fabEventListener() {
  const fab = document.getElementById('fab')
  const fabActions = document.getElementById('fabActions')
  const fabContainer = document.getElementById('fabContainer')
  const fabTooltip = document.querySelector('.fab__tooltip')

  const fabPosition = 'right'
  if (fabPosition === 'left') {
    fabContainer.style.left = '20px'
    fabContainer.style.right = 'auto'
    fabContainer.style.alignItems = 'flex-start'
  }

  const actionElements = fabActions.querySelectorAll('.fab-action')

  function toggleActions() {
    const isOpen = fab.classList.toggle('open')
    fabTooltip.textContent = isOpen ? 'Close' : 'Open'

    actionElements.forEach((action, index) => {
      setTimeout(() => {
        action.classList.toggle('show', isOpen)
      }, index * 50)
    })
  }

  function closeActions() {
    fab.classList.remove('open')

    actionElements.forEach((action) => action.classList.remove('show'))
  }

  fab.addEventListener('click', (e) => {
    e.stopPropagation()
    toggleActions()
  })

  document.addEventListener('click', (e) => {
    if (!fabContainer.contains(e.target)) {
      closeActions()
    }
  })
}

function renderFloatingActionButton(alternatives, currentSheet) {
  const [latestSheet, ...rest] = alternatives
  const showBackToLatest = currentSheet !== latestSheet
  const { archiveBtn, backToLatestBtn, printBtn } = floatingActionButton(showBackToLatest)

  arvhiveEventListener(archiveBtn, rest)

  fabEventListener()

  printBtn.addEventListener('click', () => {
    window.print()
  })

  backToLatestBtn.addEventListener('click', () => {
    if (showBackToLatest) {
      window.location.href = '/'
    }
  })
}

module.exports = { renderFloatingActionButton }
