/// <reference types="cypress" />

import shoppers from '../../../fixtures/login/b2cShoppers.json'
import '../../../support/login/api/commands/login'

describe('Perform Login via API', () => {
  before(() => {
    cy.clearCookies({ domain: null })
    cy.clearLocalStorage({ domain: null })
  })

  Cypress._.times(3, (n) => {
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
