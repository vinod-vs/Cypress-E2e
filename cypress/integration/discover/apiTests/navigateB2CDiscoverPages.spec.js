/// <reference types="cypress" />
import TestFilter from '../../../support/TestFilter'
import '../../../support/signUp/api/commands/signUp'
import '../../../support/login/api/commands/login'
import '../../../support/logout/api/commands/logout'
import b2cDiscoverPages from '../../../fixtures/b2cDiscoverPages/b2cDiscoverPages.json'
import '../../../support/discover/api/commands/navigateDiscoverPages'

TestFilter(['B2C', 'API', 'P0'], () => {
    describe('[API] Navigate To Discover pages', () => {
        before(() => {
            cy.clearCookies({ domain: null })
            cy.clearLocalStorage({ domain: null })
            cy.logOutViaApi()
        })

        it('Should be able to navigate to all Discover pages', () => {
            cy.loginWithNewShopperViaApi()

            cy.navigateDiscoverPage('navigateToDiscoverPageEndpoint').then((response) => {
                expect(response[0].ID).to.not.be.null
                expect(response[0]).to.have.property('Name', 'Fresh Ideas For You')
                expect(response[0]).to.have.property('UrlPart', 'home')
            })

            // cy.navigateDiscoverPage('navigateToDiscoverPageEndpoint').then((response) => {
            //     Cypress._.times(b2cDiscoverPages.length, (n) => {
            //         expect(response[n].Name).to.eqls(b2cDiscoverPages[n].PageName)
            //     })
            // })

            //     Cypress._.times(b2cDiscoverPages.length, (n) => {
            //         cy.navigateDiscoverPage(b2cDiscoverPages[n].EndPointName)
            //     })
        })


    })
})



