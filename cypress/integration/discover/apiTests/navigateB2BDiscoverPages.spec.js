/// <reference types="cypress" />

import TestFilter from '../../../support/TestFilter'
import b2bShopper from '../../../fixtures/login/b2bLogin.json'
import b2bDiscoverPages from '../../../fixtures/b2bDiscoverPages/b2bDiscoverPages.json'
import '../../../support/login/api/commands/login'
import '../../../support/discover/api/commands/navigateDiscoverPages'
import '../../../support/logout/api/commands/logout'

TestFilter(['B2B-API'], () => {
  describe('[API] Navigate Woolworths at Work Discover pages', () => {
    before(() => {
      cy.clearCookies({ domain: null })
      cy.clearLocalStorage({ domain: null })
      cy.logOutViaApi()
    })

    it('Should be able to navigate to all Woolworths at Work Discover pages', () => {
      cy.loginViaApi(b2bShopper).then((response) => {
        expect(response).to.have.property('LoginResult', 'Success')
      })

      cy.navigateDiscoverPage('discoverPageEndPoint').then((response) => {
        Cypress._.times(b2bDiscoverPages.length, (n) => {
          expect(response[n].Name).to.eqls(b2bDiscoverPages[n].PageName)
        })
      })

      Cypress._.times(b2bDiscoverPages.length, (n) => {
        cy.navigateDiscoverPage(b2bDiscoverPages[n].EndPointName)
      })
    })
  })
})
