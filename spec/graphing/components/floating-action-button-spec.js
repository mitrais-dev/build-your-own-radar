const { renderFloatingActionButton } = require('../../../src/graphing/components/floatingAction')
jest.mock('d3', () => {
  return {
    select: jest.fn(),
  }
})

describe('Floating Actions', function () {
  beforeEach(() => {
    document.body.innerHTML = ''
    document.head.innerHTML = ''
  })

  it('should render floating action buttons and archive panel', () => {
    renderFloatingActionButton(['1', '2'], '1')

    // Test buttons container
    const buttonsContainer = document.querySelector('.fab-container')
    expect(buttonsContainer).not.toBeNull()

    // Test print button
    const printBtn = document.getElementById('printBtn')
    expect(printBtn).not.toBeNull()
    expect(printBtn.querySelector('img')).not.toBeNull()
    expect(printBtn.querySelector('.fab-action__tooltip')?.textContent).toBe('Print This Radar')

    // Test archive button
    const archiveBtn = document.getElementById('archiveBtn')
    expect(archiveBtn).not.toBeNull()
    expect(archiveBtn.querySelector('img')).not.toBeNull()
    expect(archiveBtn.querySelector('.fab-action__tooltip')?.textContent).toBe('Archive')

    const backToLatestBtn = document.getElementById('backToLatestBtn')
    expect(backToLatestBtn).toBeNull()

    // Test archive panel
    const archivePanel = document.getElementById('archivePanel')
    expect(archivePanel).not.toBeNull()
    expect(archivePanel.className).toBe('archive-panel')

    // Test loader inside archive panel
    const loader = document.getElementById('loader')
    expect(loader).not.toBeNull()
    expect(loader.textContent).toBe('Loading more...')
  })

  it('should render back to latest button because current sheet is not the latest', () => {
    renderFloatingActionButton(['1', '2'], '2')

    const backToLatestBtn = document.getElementById('backToLatestBtn')
    expect(backToLatestBtn).not.toBeNull()
  })
})
