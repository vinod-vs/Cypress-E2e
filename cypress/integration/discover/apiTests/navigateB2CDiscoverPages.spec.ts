/// <reference types="cypress" />

import TestFilter from '../../../support/TestFilter'
import b2cDiscoverPages from '../../../fixtures/b2cDiscoverPages/b2cDiscoverPages.json'
import '../../../support/login/api/commands/login'
import '../../../support/discoverb2c/api/commands/navigateb2cDiscoverPages'

TestFilter(['B2C', 'API', 'P0'], () => {
    describe('[API] Navigate Discover pages', () => {
        before(() => {
            cy.clearCookies({ domain: null })
            cy.clearLocalStorage({ domain: null })
            cy.loginWithNewShopperViaApi()
        })

        it('Should be able to navigate to all Discover pages', () => {
            cy.navigateDiscoverPageB2c('b2cDiscoverPageEndPoint').then((response: string | any[]) => {
                Cypress._.times(response.length, (n) => {
                    expect(response[n].Name).to.eqls(b2cDiscoverPages[n].PageName)
                })
            })

            Cypress._.times(b2cDiscoverPages.length, (n) => {
                cy.navigateDiscoverPageB2c(b2cDiscoverPages[n].EndPointName)
            })
        })
    })
})