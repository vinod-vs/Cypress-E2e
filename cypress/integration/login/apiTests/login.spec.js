/// <reference types="cypress" />

import shoppers from '../../../fixtures/login/b2cShoppers.json'
import '../../../support/login/api/commands/login'

describe('Perform Login via API', () => {
  before(() => {
    cy.clearCookies({ domain: null })
    cy.clearLocalStorage({ domain: null })
  })

  beforeEach(() => {
    Cypress.Cookies.preserveOnce('w-rctx', 'akaalb_uatsite', 'akavpau_uatsite', 'INGRESSCOOKIE', 'uat-wow-auth-token', 'wow-auth-token')
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
