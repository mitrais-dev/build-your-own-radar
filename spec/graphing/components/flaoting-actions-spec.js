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
    const buttonsContainer = document.querySelector('.floating-buttons')
    expect(buttonsContainer).not.toBeNull()

    // Test print button
    const printBtn = document.getElementById('printBtn')
    expect(printBtn).not.toBeNull()
    expect(printBtn.querySelector('img')).not.toBeNull()
    expect(printBtn.querySelector('.tooltip')?.textContent).toBe('Print This Radar')

    // Test archive button
    const archiveBtn = document.getElementById('archiveBtn')
    expect(archiveBtn).not.toBeNull()
    expect(archiveBtn.querySelector('img')).not.toBeNull()
    expect(archiveBtn.querySelector('.tooltip')?.textContent).toBe('Archive')

    // Test archive panel
    const archivePanel = document.getElementById('archivePanel')
    expect(archivePanel).not.toBeNull()
    expect(archivePanel.className).toBe('archive-panel')

    // Test loader inside archive panel
    const loader = document.getElementById('loader')
    expect(loader).not.toBeNull()
    expect(loader.textContent).toBe('Loading more...')
  })
})
