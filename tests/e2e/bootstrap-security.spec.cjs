const path = require('node:path')
const { test, expect } = require('@playwright/test')

async function loadBootstrap(page) {
  await page.setContent('<button id="probe">Ready</button><button id="tip">Tooltip</button>')
  await page.addScriptTag({ path: path.resolve('dist/lib/jquery/dist/jquery.min.js') })
  await page.addScriptTag({
    path: path.resolve('dist/lib/bootstrap-sass/assets/javascripts/bootstrap.min.js')
  })
}

test('data-loading-text is text, never executable HTML', async ({ page }) => {
  await loadBootstrap(page)
  const payload =
    '<img src="data:image/x-invalid;base64,AA==" onerror="window.buttonPayloadExecuted = true">'
  await page.evaluate((value) => {
    window.buttonPayloadExecuted = false
    window.jQuery('#probe').attr('data-loading-text', value).button('loading')
  }, payload)
  await page.waitForFunction(() => document.querySelector('#probe').disabled)
  await expect(page.locator('#probe img')).toHaveCount(0)
  await expect(page.locator('#probe')).toHaveText(payload)
  expect(await page.evaluate(() => window.buttonPayloadExecuted)).toBe(false)
  await page.evaluate(() => window.jQuery('#probe').button('reset'))
  await expect(page.locator('#probe')).toHaveText('Ready')
})

test('tooltip sanitization survives a clobbered document implementation', async ({ page }) => {
  await loadBootstrap(page)
  await page.evaluate(() => {
    window.tooltipPayloadExecuted = false
    Object.defineProperty(document, 'implementation', { configurable: true, value: {} })
    window
      .jQuery('#tip')
      .tooltip({
        html: true,
        animation: false,
        trigger: 'manual',
        title:
          '<b>Safe label</b><img src="data:image/x-invalid;base64,AA==" onerror="window.tooltipPayloadExecuted = true">'
      })
      .tooltip('show')
  })
  await expect(page.locator('.tooltip b')).toHaveText('Safe label')
  await expect(page.locator('.tooltip [onerror]')).toHaveCount(0)
  expect(await page.evaluate(() => window.tooltipPayloadExecuted)).toBe(false)
})
