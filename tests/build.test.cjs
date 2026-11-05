const test = require('node:test')
const assert = require('node:assert/strict')
const fs = require('node:fs')
const path = require('node:path')
const sass = require('sass')
const { conditionClass, cssImporter } = require('../build/helpers.cjs')
const { patchBootstrap } = require('../build/patch-bootstrap.cjs')

test('conditionClass preserves active membership and its inverse', () => {
  assert.equal(conditionClass('active', 'charts', 'charts maps'), 'active')
  assert.equal(conditionClass('active', 'tables', 'charts maps'), '')
  assert.equal(conditionClass('collapsed', 'tables', 'charts maps', true), 'collapsed')
  assert.equal(conditionClass('collapsed', 'charts', 'charts maps', true), '')
})

test('legacy CSS: imports remain inline with the Dart Sass importer', (context) => {
  const dir = fs.mkdtempSync(path.join(process.cwd(), '.legacy-css-'))
  context.after(() => fs.rmSync(dir, { recursive: true, force: true }))
  fs.writeFileSync(path.join(dir, 'sample.css'), '.legacy-import { color: #123; }')
  const relative = path.relative(process.cwd(), path.join(dir, 'sample'))
  const result = sass.compileString('@import "CSS:../../../' + relative + '";', {
    importers: [cssImporter]
  })
  assert.match(result.css, /\.legacy-import/)
  assert.ok(!result.css.includes('@import'))
})

test('every source template produces its page and preserves layout blocks', () => {
  for (const name of fs.readdirSync('src').filter((name) => name.endsWith('.hbs'))) {
    const html = fs.readFileSync('dist/' + name.replace('.hbs', '.html'), 'utf8')
    assert.ok(html.includes('<!DOCTYPE html>'))
    assert.ok(!html.includes('{{#'))
    assert.ok(html.includes('css/application.min.css'))
    const activeHtml = html.replace(/<!--[\s\S]*?-->/g, '')
    for (const match of activeHtml.matchAll(/(?:src|href)="([^"?]+\.(?:js|css))"/g)) {
      if (!match[1].startsWith('http')) {
        assert.ok(fs.statSync(path.resolve('dist', match[1])).size > 0, match[1])
      }
    }
  }
  const home = fs.readFileSync('dist/index.html', 'utf8')
  assert.match(home, /<li class="active">\s*<a href="index.html"/)
})

test('binary images and fonts retain bytes and CSS assets resolve', () => {
  const images = fs.readdirSync('src/img').filter((file) => /\.(png|jpg)$/.test(file))
  assert.ok(images.length > 0)
  for (const file of images)
    assert.deepEqual(fs.readFileSync('dist/img/' + file), fs.readFileSync('src/img/' + file))
  assert.deepEqual(
    fs.readFileSync('dist/css/fonts/font-awesome/fontawesome-webfont.woff2'),
    fs.readFileSync('bower_components/font-awesome/fonts/fontawesome-webfont.woff2')
  )
  const css = fs.readFileSync('dist/css/application.min.css', 'utf8')
  assert.ok(!css.includes('bower_components'))
  for (const match of css.matchAll(/url\(["']?([^"')]+)["']?\)/g)) {
    const url = match[1].split(/[?#]/)[0]
    if (!url.startsWith('http') && !url.startsWith('data:'))
      assert.ok(fs.statSync(path.resolve('dist/css', url)).size > 0, url)
  }
})

test('Bootstrap backports are idempotent and reject changed inputs', async (context) => {
  const dir = fs.mkdtempSync(path.join(process.cwd(), '.bootstrap-patch-'))
  context.after(() => fs.rmSync(dir, { recursive: true, force: true }))
  const source = 'bower_components/bootstrap-sass'
  const files = [
    'package.json',
    'assets/javascripts/bootstrap.js',
    'assets/javascripts/bootstrap.min.js',
    'assets/javascripts/bootstrap/button.js',
    'assets/javascripts/bootstrap/tooltip.js'
  ]
  for (const file of files) {
    fs.mkdirSync(path.dirname(path.join(dir, file)), { recursive: true })
    fs.copyFileSync(path.join(source, file), path.join(dir, file))
  }
  const before = files.map((file) => fs.readFileSync(path.join(dir, file)))
  await patchBootstrap(dir)
  for (const [index, file] of files.entries()) {
    assert.deepEqual(fs.readFileSync(path.join(dir, file)), before[index])
  }
  fs.appendFileSync(path.join(dir, files[3]), '\n// Unexpected source change\n')
  await assert.rejects(patchBootstrap(dir), /input mismatch|unexpected changes/)
  fs.copyFileSync(path.join(source, files[3]), path.join(dir, files[3]))
  fs.appendFileSync(path.join(dir, files[2]), '\n// Unexpected bundle change\n')
  await assert.rejects(patchBootstrap(dir), /input mismatch/)
})
