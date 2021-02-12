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
            cy.request('POST', '/apis/ui/Login/loginwithcredential', shopper).then((response) => {
                expect(response.body).to.have.property('FirstName', 'b2c')
                expect(response.body).to.have.property('LoginResult', 'Success')
            })

            cy.getCookie('w-rctx').should('exist')
        }
    })
})