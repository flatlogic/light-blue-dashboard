const { test, expect } = require('@playwright/test')

test('production pages and PJAX preserve navigation, widgets and charts', async ({ page }) => {
  const errors = []
  const missing = []
  page.on('pageerror', (error) => {
    errors.push(error.message)
    console.error(error.message)
  })
  page.on('response', (response) => {
    if (response.url().startsWith('http://127.0.0.1:43195/') && response.status() >= 400) {
      missing.push(new URL(response.url()).pathname)
    }
  })
  for (const name of [
    'index',
    'charts',
    'tables',
    'typography',
    'icons',
    'notifications',
    'login'
  ]) {
    await page.goto('/' + name + '.html')
    await expect(page.locator('body')).not.toBeEmpty()
    if (name !== 'login') await expect(page.locator('#sidebar')).toBeVisible()
    if (name === 'charts') await expect(page.locator('#flot-main canvas').first()).toBeVisible()
    if (name === 'tables') await expect(page.locator('table').first()).toBeVisible()
  }
  await page.goto('/index.html')
  await page.locator('#settings').click()
  const settings = page.locator('.settings-popover')
  await expect(settings.locator('#sidebar-toggle button')).toHaveCount(2)
  await settings.locator('#sidebar-toggle button[data-value="right"]').click()
  await expect(page.locator('body')).toHaveClass(/sidebar-on-right/)
  await settings.locator('#sidebar-toggle button[data-value="left"]').click()
  await expect(page.locator('body')).not.toHaveClass(/sidebar-on-right/)
  await page.locator('#settings').click()
  await page.locator('#sidebar a[href="tables.html"]').click()
  await expect(page).toHaveURL(/tables\.html$/)
  await expect(page.locator('table').first()).toBeVisible()
  await page.locator('#sidebar a[href="#elements-collapse"]').click()
  await page.locator('#sidebar a[href="charts.html"]').click()
  await expect(page).toHaveURL(/charts\.html$/)
  await expect(page.locator('#flot-main canvas').first()).toBeVisible()
  await page.waitForFunction(() => {
    const plot = window.jQuery('#flot-main').data('plot')
    return plot && plot.getData()[2].data.at(-1)[0] >= 6.99
  })
  await page.screenshot({ path: 'test-results/charts.png', fullPage: true })
  expect(missing).toEqual([])
  expect(errors).toEqual([])
})
