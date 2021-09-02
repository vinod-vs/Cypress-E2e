/// <reference types="cypress" />

import TestFilter from '../../../support/TestFilter'
import shopper from '../../../fixtures/login/b2cLogin.json'
import '../../../support/login/api/commands/login'
import '../../../support/discover/api/commands/navigateDiscoverPages'

TestFilter(['B2C-API'], () => {
    describe('[API] Navigate Woolworths at Work Discover pages', () => {
        before(() => {
            cy.clearCookies({ domain: null })
            cy.clearLocalStorage({ domain: null })
        })

        it('Should be able to navigate to all Woolworths at Work Discover pages', () => {
            cy.loginViaApi(shopper).then((response) => {
                expect(response).to.have.property('LoginResult', 'Success')
            })

            cy.navigateDiscoverPage('navigateToDiscoverPageEndpoint').then((response) => {
                expect(response[0].ID).to.not.be.null
                expect(response[0]).to.have.property('Name', 'Fresh Ideas For You')
                expect(response[0]).to.have.property('UrlPart', 'home')
            })
        })

    })
})

