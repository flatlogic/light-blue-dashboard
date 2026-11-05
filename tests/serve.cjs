require('browser-sync')
  .create()
  .init({ server: 'dist',
  listen: '127.0.0.1', port: 43195, open: false, ui: false, logLevel: 'silent' })
