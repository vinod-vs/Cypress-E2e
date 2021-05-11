/// <reference types="cypress" />

import shoppers from '../../../fixtures/login/shoppers.json'
import TestFilter from '../../../support/TestFilter'
import '../../../support/login/api/commands/login'

TestFilter(['API'], () => {
  describe('[API] Perform Login', () => {
    before(() => {
      cy.clearCookies({ domain: null })
      cy.clearLocalStorage({ domain: null })
    })

    Cypress._.times(shoppers.length, (n) => {
      it('Login as ' + shoppers[n].email, {
        retries: {
          runMode: 1
        }
      }, () => {
        cy.loginViaApi(shoppers[n]).then((response) => {
          expect(response).to.have.property('LoginResult', 'Success')

          cy.getCookie('w-rctx').should('exist')
        })
      })
    })
  })
})
