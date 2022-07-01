/// <reference types="cypress" />

import b2cShopper from '../../../fixtures/login/b2cLogin.json'
import TestFilter from '../../../support/TestFilter'
import allProductsbody from '../../../fixtures/lists/allProducts.json'
import '../../../support/login/api/commands/login'
import '../../../support/lists/api/commands/otherAPIs'

let term;
let displayName;

TestFilter(['API', 'B2C', 'P0'], () => {
  describe('[API] Verify that the All Products Filter API is working as expected', () => {
    before(() => {
      cy.clearCookies({ domain: null })
      cy.clearLocalStorage({ domain: null })
      Cypress.Cookies.preserveOnce('w-rctx')
    })

    it('Should verify that the All Products Filter API is working as expected', () => {
      cy.loginViaApiWith2FA(b2cShopper, Cypress.env('otpValidationSwitch'), Cypress.env('otpStaticCode'))

      // Fetch the Product name and its brand and set it to the filter
      cy.getAllProducts(allProductsbody).then((response) => {
        expect(response.status).to.eq(200)
        displayName = response.body.Items[0].DisplayName
        console.log('Display Name is:' + displayName)
        term = response.body.Items[0].Brand
        console.log('Brand is:' + term)
        allProductsbody.Filters = [{ Key: 'Brand', Items: [{ Term: term }] }]
      })

      // Verify that the filter result- Display name and brand name match with the saved ones
      cy.getAllProducts(allProductsbody).then((response) => {
        expect(response.status).to.eq(200)
        const data = response.body.Items
        let result, brandName
        const matchingDisplayName = data.filter(Item => Item.DisplayName === displayName)
        expect(matchingDisplayName).length(1)
        console.log('Verified that only one of the products has matching display name')
        brandName = Cypress._.chain(response.body.Items).map('Brand').value()
        // console.log(brandName)
        result = brandName.every(v => v === term)
        expect(result).to.eq(true)
        console.log('Verified that all the products are of the same brand')
      })
    })
  })
})
