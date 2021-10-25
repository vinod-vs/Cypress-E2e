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
import '@shelex/cypress-allure-plugin'
import '@bahmutov/cy-api/support'

const customCommands = require('./commands.js')
module.exports = {
  commands: customCommands
}

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

const chainStart = Symbol()
cy.all = function (...commands) {
  const _ = Cypress._
  const chain = cy.wrap(null, { log: false })
  const stopCommand = _.find(cy.queue.commands, {
    attributes: { chainerId: chain.chainerId }
  })
  const startCommand = _.find(cy.queue.commands, {
    attributes: { chainerId: commands[0].chainerId }
  })
  const p = chain.then(() => {
    return _(commands)
      .map(cmd => {
        return cmd[chainStart]
          ? cmd[chainStart].attributes
          : _.find(cy.queue.commands, {
            attributes: { chainerId: cmd.chainerId }
          }).attributes
      })
      .concat(stopCommand.attributes)
      .slice(1)
      .flatMap(cmd => {
        return cmd.prev.get('subject')
      })
      .value()
  })
  p[chainStart] = startCommand
  return p
}
