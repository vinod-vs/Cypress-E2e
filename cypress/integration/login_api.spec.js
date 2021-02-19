/// <reference types="cypress" />

const shoppers = require('../fixtures/b2cShoppers.json')

describe('Perform Login via API', () => {
  before(() => {
    cy.clearCookies({ domain: null })
    cy.clearLocalStorage({ domain: null })
  })

  beforeEach(function () {
    Cypress.Cookies.preserveOnce('w-rctx', 'akaalb_uatsite', 'akavpau_uatsite', 'INGRESSCOOKIE', 'uat-wow-auth-token', 'wow-auth-token')

    cy.fixture('b2cShoppers.json').as('b2cShopper')
  })

  shoppers.forEach((shopper) => {
    it('Login as ' + shopper.email, function () {
      cy.LoginViaApi(shopper)
    })
  })
})
