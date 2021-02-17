/// <reference types="cypress" />

describe("Perform Login via API", () => {
    before(() => {
        cy.clearCookies({ domain: null })
        cy.clearLocalStorage({ domain: null })
    })

    beforeEach(() => {
        Cypress.Cookies.preserveOnce('w-rctx', 'akaalb_uatsite', 'akavpau_uatsite', 'INGRESSCOOKIE', 'uat-wow-auth-token', 'wow-auth-token')

        cy.fixture('b2cShoppers.json').as('b2cShopper')
    })

    it('Login', function() {
        for (var shopper of this.b2cShopper) {
            cy.LoginViaApi(shopper)
        }
    })
})