/// <reference types="cypress" />

import TestFilter from '../../../support/TestFilter'
import '../../../support/login/api/commands/login'
import '../../../support/expressionOfInterest/api/commands/navigateExpressionOfInterestPage'

TestFilter(['B2B-API'], () => {
  describe('[API] Navigate Woolworths at Work Expression of Interest page', () => {
    before(() => {
      cy.clearCookies({ domain: null })
      cy.clearLocalStorage({ domain: null })
    })

    it('Should be able to navigate to Woolworths at Work Expression of Interest page', () => {
      cy.navigateExpressionOfInterestPage('expressionOfInterestPageEndPoint').then((response: any) => {
        expect(response.MetaDescription).to.eqls('Woolworths at Work is here to deliver healthier food, ' +
          'essential products, easy purchasing & operational efficiencies to organisations across Australia.')
        expect(response.Title).to.eqls('Woolworths at Work - Buy Supplies for Organisations')
      })
    })
  })
})
