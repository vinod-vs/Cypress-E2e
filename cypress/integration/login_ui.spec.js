/// <reference types="cypress" />

describe('Perform Login via UI', () => {
    before(() => {
        cy.clearCookies({ domain: null })
        cy.clearLocalStorage({ domain: null })
    })

    beforeEach(() => {
        cy.fixture('b2cShoppers.json').as('b2cShopper')
    })

    it('Login', function() {
        for (var shopper of this.b2cShopper) {
            cy.LoginViaUi(shopper)
        }
    })
})