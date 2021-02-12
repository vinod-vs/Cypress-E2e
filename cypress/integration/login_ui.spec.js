/// <reference types="cypress" />

describe('Perform Login via UI', () => {
    beforeEach(() => {
        cy.fixture('b2cShoppers.json').as('b2cShopper')
    })

    it('Login', function() {
        for (var shopper of this.b2cShopper) {
            cy.visit('shop/securelogin')

            cy.get('#loginForm-Email').type(shopper.email)

            cy.get('#loginForm-Password').type(shopper.password)

            cy.get('.primary-legacy').click()

            cy.contains('My Account').click()

            cy.contains('Logout').click()
        }
    })
})