const fs = require('node:fs')
const path = require('node:path')
const { pathToFileURL, fileURLToPath } = require('node:url')

function conditionClass(className, current, candidates, inverse) {
  const matches = candidates.split(' ').includes(current)
  return matches !== (inverse === true) ? className : ''
}

// Preserve the previous CSS:../../../ import syntax while using Dart Sass's importer API.
const cssImporter = {
  canonicalize(url) {
    if (!/^css:/i.test(url)) {
      return null
    }
    const relative = url.slice(4).replace(/^(\.\.\/)+/, '')
    return pathToFileURL(path.resolve(relative + '.css'))
  },
  load(url) {
    return { contents: fs.readFileSync(fileURLToPath(url), 'utf8'), syntax: 'css' }
  }
}

module.exports = { conditionClass, cssImporter }
