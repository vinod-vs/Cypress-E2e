/// <reference types="cypress" />
import TestFilter from '../../../support/TestFilter'
import '../../../support/login/ui/commands/login'
import '../../../support/utilities/ui/utility'
import '../../../support/accessibility/accessibility'
import shoppers from '../../../fixtures/promotionEngines/shoppers.json'
import { onHomePage } from '../../../support/homePage/ui/pageObjects/HomePage'
TestFilter(['B2C', 'UI', 'P2'], () => {
    describe('[UI] Accessibility Test', () => {
        beforeEach(() => {
            cy.clearCookies({ domain: null })
            cy.clearLocalStorage({ domain: null })
            cy.loginViaUi(shoppers.PESAccount2)
        })
        it('Test the page at initial load ', () => {
            onHomePage.getSearchHeader().should('exist')
            cy.checkPageA11y()
        })
    })
})