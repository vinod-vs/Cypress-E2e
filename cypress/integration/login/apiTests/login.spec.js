/// <reference types="cypress" />

import b2cShoppers from '../../../fixtures/login/b2cShoppers.json'
import b2bShoppers from '../../../fixtures/login/b2bShoppers.json'
import TestFilter from '../../../support/TestFilter'
import '../../../support/login/api/commands/login'

TestFilter(['B2C', 'API', 'P0'], () => {
  describe('[API] Perform Login', () => {
    before(() => {
      cy.clearCookies({ domain: null })
      cy.clearLocalStorage({ domain: null })
    })

    Cypress._.times(b2cShoppers.length, (n) => {
      it('Login as ' + b2cShoppers[n].email, {
        retries: {
          runMode: 1
        }
      }, () => {
        cy.loginViaApi(b2cShoppers[n]).then((response) => {
          expect(response).to.have.property('LoginResult', 'Success')

          cy.getCookie('w-rctx').should('exist')
        })
      })
    })
  })
})

TestFilter(['B2B', 'API', 'P0'], () => {
  describe('[API] Perform Login', () => {
    before(() => {
      cy.clearCookies({ domain: null })
      cy.clearLocalStorage({ domain: null })
    })

    Cypress._.times(b2bShoppers.length, (n) => {
      it('Login as ' + b2bShoppers[n].email, {
        retries: {
          runMode: 1
        }
      }, () => {
        cy.loginViaApi(b2bShoppers[n]).then((response) => {
          expect(response).to.have.property('LoginResult', 'Success')

          cy.getCookie('w-rctx').should('exist')
        })
      })
    })
  })
})
