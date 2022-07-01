/// <reference types="cypress" />

import b2cShopper from '../../../fixtures/login/b2cLogin.json'
import b2bShopper from '../../../fixtures/login/b2bLogin.json'
import TestFilter from '../../../support/TestFilter'
import allProductsBody from '../../../fixtures/lists/allProducts.json'
import '../../../support/login/api/commands/login'
import '../../../support/lists/api/commands/otherAPIs'

TestFilter(['API', 'B2C', 'B2B', 'P0'], () => {
  describe('[API] Verify that the search is working using search bar', () => {
    before(() => {
      cy.clearCookies({ domain: null })
      cy.clearLocalStorage({ domain: null })
      Cypress.Cookies.preserveOnce('w-rctx')
    })

    it('Should verify that the search is working using search bar', () => {
      // login to the application
      if (Cypress.env('fileConfig') === 'b2c') {
        cy.loginViaApiWith2FA(b2cShopper, Cypress.env('otpValidationSwitch'), Cypress.env('otpStaticCode'))
      } else if (Cypress.env('fileConfig') === 'b2b') {
        cy.loginViaApi(b2bShopper).then((response) => {
          expect(response).to.have.property('LoginResult', 'Success')
        })
      }

      // Set the search term and search products
      allProductsBody.SearchTerm = 'Milk'
      cy.getAllProducts(allProductsBody).then((response) => {
        expect(response.status).to.eq(200)
        console.log('Product Search was successful.')
      })
    })
  })
})
