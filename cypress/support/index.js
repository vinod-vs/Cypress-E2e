// ***********************************************************
// This example support/index.js is processed and
// loaded automatically before your test files.
//
// This is a great place to put global configuration and
// behavior that modifies Cypress.
//
// You can change the location of this file or turn off
// automatically serving support files with the
// 'supportFile' configuration option.
//
// You can read more here:
// https://on.cypress.io/configuration
// ***********************************************************

// Import commands.js using ES2015 syntax:
const customCommands = require('./commands.js')
module.exports = {
  commands: customCommands
}

import '@shelex/cypress-allure-plugin'
import '@bahmutov/cy-api/support'

require('cypress-xpath')

// Alternatively you can use CommonJS syntax:
// require('./commands')

// note this may conflict with clearcookies as defaults always supersedes
Cypress.Cookies.defaults({
  preserve: ['w-rctx']
})

// Required to ignore uncaught exceptions thrown by the application else tests will fail on an occurances
Cypress.on('uncaught:exception', (err, runnable) => {
  // returning false here prevents Cypress from
  // failing the test
  return false
})
