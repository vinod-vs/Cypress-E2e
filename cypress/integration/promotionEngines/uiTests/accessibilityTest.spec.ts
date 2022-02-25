/// <reference types="cypress" />

import TestFilter from '../../../support/TestFilter'
import '../../../support/login/ui/commands/login'
import '../../../support/utilities/ui/utility'
import shoppers from '../../../fixtures/promotionEngines/shoppers.json'
import { onHomePage } from '../../../support/homePage/ui/pageObjects/HomePage'
import '../../../support/accessability/accessability'

TestFilter(['UI', 'B2C', 'PES', 'P2', 'OHNO'], () => {
    describe('[UI] Accessibility Test', () => {

        beforeEach(() => {
            cy.clearCookies({ domain: null })
            cy.clearLocalStorage({ domain: null })
            cy.loginViaUi(shoppers.PESAccount2)
          })

        it('Test case 1', () => {
            cy.injectAxe
            onHomePage.getSearchHeader().should('exist')
            cy.checkA11y_wcag2aa_exclude_color_contrast
        })
    })
})