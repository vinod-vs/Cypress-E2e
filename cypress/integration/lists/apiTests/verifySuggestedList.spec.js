/// <reference types="cypress" />

import b2cShopper from '../../../fixtures/login/b2cLogin.json'
import b2bShopper from '../../../fixtures/login/b2bLogin.json'
import TestFilter from '../../../support/TestFilter'
import '../../../support/login/api/commands/login'
import '../../../support/lists/api/commands/otherAPIs'

TestFilter(['API', 'B2C', 'B2B', 'P0'], () => {
  describe('[API] Verify that the Suggested lists are not empty', () => {
    before(() => {
      cy.clearCookies({ domain: null })
      cy.clearLocalStorage({ domain: null })
      Cypress.Cookies.preserveOnce('w-rctx')
    })

    it('Should verify that the Suggested lists are not empty', () => {
      if (Cypress.env('fileConfig') === 'b2c') {
        cy.loginViaApiWith2FA(b2cShopper, Cypress.env('otpValidationSwitch'), Cypress.env('otpStaticCode'))
      } else if (Cypress.env('fileConfig') === 'b2b') {
        cy.loginViaApi(b2bShopper).then((response) => {
          expect(response).to.have.property('LoginResult', 'Success')
        })
      }

      cy.getSuggestedLists().then((response) => {
        expect(response.status).to.eq(200)
        const data = response.body.Response
        data.forEach(obj => {
          console.log(obj.Name)
          expect(obj.ProductsCount).to.greaterThan(0)
          console.log('-----------------')
        })
      })
    })
  })
})
