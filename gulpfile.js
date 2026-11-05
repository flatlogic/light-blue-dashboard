'use strict'

const gulp = require('gulp')
const fs = require('node:fs/promises')
const path = require('node:path')
const { pipeline } = require('node:stream/promises')
const handlebars = require('handlebars').create()
const layouts = require('handlebars-layouts')
const sass = require('sass')
const { minify } = require('terser')
const browserSync = require('browser-sync').create()
const { conditionClass, cssImporter } = require('./build/helpers.cjs')
const { patchInstalledBootstrap } = require('./build/patch-bootstrap.cjs')
const pkg = require('./package.json')
const production = process.argv.includes('--production') || process.env.NODE_ENV === 'production'

handlebars.registerHelper(layouts(handlebars))
handlebars.registerHelper('conditionClass', conditionClass)

async function clean() {
  await fs.rm('dist', { recursive: true, force: true })
}

async function pages() {
  for (const name of await fs.readdir('src/partials')) {
    if (name.endsWith('.hbs')) {
      handlebars.registerPartial(
        path.basename(name, '.hbs'),
        await fs.readFile('src/partials/' + name, 'utf8')
      )
    }
  }
  await fs.mkdir('dist', { recursive: true })
  for (const name of await fs.readdir('src')) {
    if (name.endsWith('.hbs')) {
      const template = handlebars.compile(await fs.readFile('src/' + name, 'utf8'))
      const html = template({
        productionEnv: production,
        title: pkg.description,
        preHtml:
          '<!-- ' +
          pkg.name +
          ' - v' +
          pkg.version +
          ' - ' +
          new Date().toISOString().slice(0, 10) +
          ' -->\n'
      })
      await fs.writeFile('dist/' + name.replace(/\.hbs$/, '.html'), html)
    }
  }
}

async function styles() {
  const result = sass.compile('src/sass/application.scss', {
    style: production ? 'compressed' : 'expanded',
    importers: [cssImporter]
  })
  await fs.mkdir('dist/css', { recursive: true })
  await fs.writeFile('dist/css/application' + (production ? '.min' : '') + '.css', result.css)
}

function copy(patterns, base, destination) {
  return pipeline(
    gulp.src(patterns, { base, encoding: false, allowEmpty: true }),
    gulp.dest(destination)
  )
}

async function assets() {
  await Promise.all([
    copy(['src/img/**/*', 'src/server/**/*'], 'src', 'dist'),
    copy('src/sass/fonts/**/*', 'src/sass', 'dist/css'),
    copy(
      'bower_components/bootstrap-sass/assets/fonts/**/*',
      'bower_components/bootstrap-sass/assets',
      'dist/css'
    ),
    copy(
      'bower_components/font-awesome/fonts/**/*',
      'bower_components/font-awesome/fonts',
      'dist/css/fonts/font-awesome'
    )
  ])
}

async function scripts() {
  await copy('src/js/**/*', 'src', 'dist')
  if (production) {
    for await (const file of gulp.src('src/js/**/*.js', { base: 'src' })) {
      const result = await minify(file.contents.toString(), {
        format: { comments: /^!|@license|@preserve/ }
      })
      await fs.writeFile(path.join('dist', file.relative), result.code)
    }
  }
}

async function libraries() {
  await patchInstalledBootstrap()
  await fs.rm('dist/lib', { recursive: true, force: true })
  await copy(
    ['bower_components/**/*.{png,gif}', 'bower_components/**/LICENSE*'],
    'bower_components',
    'dist/lib'
  )
  await copy('src/vendor/**/*', 'src/vendor', 'dist/lib')
  // Copy the scripts actually referenced by rendered pages, not vendor test runners.
  const scripts = new Set()
  for (const name of await fs.readdir('dist')) {
    if (name.endsWith('.html')) {
      const html = (await fs.readFile('dist/' + name, 'utf8')).replace(/<!--[\s\S]*?-->/g, '')
      for (const match of html.matchAll(/<script\b[^>]*\bsrc=["'](lib\/[^"']+\.js)["']/g)) {
        scripts.add(match[1])
      }
    }
  }
  for (const target of scripts) {
    let source = target.replace(/^lib\//, 'bower_components/')
    if (target === 'lib/jquery.sparkline/index.js') {
      source = 'bower_components/jquery.sparkline/jquery.sparkline.js'
    }
    await fs.mkdir(path.dirname('dist/' + target), { recursive: true })
    await fs.copyFile(source, 'dist/' + target)
  }
}

const build = gulp.series(clean, pages, gulp.parallel(styles, scripts, assets, libraries))
function watch() {
  return gulp.watch(['src/**/*', 'bower_components/**/*'], build)
}
function serve(done) {
  browserSync.init(
    { server: 'dist', port: 43195, listen: '127.0.0.1', open: false, ui: false },
    done
  )
  gulp.watch(
    ['src/**/*', 'bower_components/**/*'],
    gulp.series(build, function reload(done) {
      browserSync.reload()
      done()
    })
  )
}

exports.clean = clean
exports.build = build
exports.default = build
exports.watch = gulp.series(build, watch)
exports['dist-watch'] = exports.watch
exports.serve = gulp.series(build, serve)
exports['dist-templates'] = pages
exports['dist-sass'] = gulp.parallel(styles, assets)
exports['dist-scripts'] = scripts
exports['dist-libs'] = gulp.series(pages, libraries)
exports['dist-misc'] = assets
