/// <reference types="cypress" />

import shoppers from '../../../fixtures/login/b2cShoppers.json'
import '../../../support/login/api/commands/login'

describe('Perform Login via API', () => {
  before(() => {
    cy.clearCookies({ domain: null })
    cy.clearLocalStorage({ domain: null })
  })

  shoppers.forEach((shopper) => {
    it('Login as ' + shopper.email, () => {
      cy.loginViaApi(shopper).then((response) => {
        expect(response).to.have.property('LoginResult', 'Success')

        cy.getCookie('w-rctx').should('exist')
      })
    })
  })
})
