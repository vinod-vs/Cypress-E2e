/// <reference types="cypress" />

import shoppers from '../../fixtures/b2cShoppers.json'
import '../../support/api/login/login'
import '../../support/api/search/search'

describe("Perform Login via API", () => {
    before(() => {
        cy.clearCookies({ domain: null })
        cy.clearLocalStorage({ domain: null })
    })

    beforeEach(() => {
        Cypress.Cookies.preserveOnce('w-rctx', 'akaalb_uatsite', 'akavpau_uatsite', 'INGRESSCOOKIE', 'uat-wow-auth-token', 'wow-auth-token')

        cy.fixture('b2cShoppers.json').as('b2cShopper')
    })

    it('Search product', () => {
        cy.loginViaApi(shoppers[0])

        cy.apiSearch('Milk').then((response) => {
            expect(response.SearchResultsCount).to.be.greaterThan(0)

            cy.log(response.SearchResultsCount)
        })
    })
})