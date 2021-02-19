/// <reference types="cypress" />

const shoppers = require('../fixtures/b2cShoppers.json')

describe('Perform Login via UI', () => {
  before(() => {
    cy.clearCookies({ domain: null })
    cy.clearLocalStorage({ domain: null })
  })

  beforeEach(() => {
    cy.fixture('b2cShoppers.json').as('b2cShopper')
  })

  shoppers.forEach((shopper) => {
    it('Login as ' + shopper.email, function () {
      cy.LoginViaUi(shopper)
    })
  })
})
