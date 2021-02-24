/// <reference types="cypress" />

import shoppers from '../../fixtures/b2cShoppers.json'
import '../../support/ui/login/login'

describe('Perform Login via UI', () => {
  before(() => {
    cy.clearCookies({ domain: null })
    cy.clearLocalStorage({ domain: null })
  })

  beforeEach(() => {
    cy.fixture('b2cShoppers.json').as('b2cShopper')
  })

  it('Login as ' + shoppers[0].email, () => {
    cy.loginViaUi(shoppers[0])
  })
})
