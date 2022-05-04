/// <reference types="cypress" />

import b2cShopper from '../../../fixtures/login/b2cLogin.json'
import b2bShopper from '../../../fixtures/login/b2bLogin.json'
import TestFilter from '../../../support/TestFilter'
import pastShopsBody from '../../../fixtures/lists/pastShops.json'
import '../../../support/login/api/commands/login'
import '../../../support/lists/api/commands/otherAPIs'

var mapPastShops = new Map();
let count = 1;

TestFilter(['API', 'B2C', 'B2B', 'P0'], () => {
  describe('[API] Verify that the Pastshops API is running without failure', () => {
    before(() => {
      cy.clearCookies({ domain: null })
      cy.clearLocalStorage({ domain: null })
      Cypress.Cookies.preserveOnce('w-rctx')
    })

    it('Should verify that the Pastshops API is running without failure', () => {
      if (Cypress.env('fileConfig') === 'b2c') {
        cy.loginViaApiWith2FA(b2cShopper, Cypress.env('otpValidationSwitch'), Cypress.env('otpStaticCode'))
      } else if (Cypress.env('fileConfig') === 'b2b') {
        cy.loginViaApi(b2bShopper).then((response) => {
          expect(response).to.have.property('LoginResult', 'Success')
        })
      }

      // Get the past shops details from the left panel and main page and compare them
      cy.getPastShops().then((response) => {
        expect(response.status).to.eq(200)
        const data = response.body.History
        data.forEach(obj => {
          Object.entries(obj).forEach(([key, value]) => {
            mapPastShops.set(key + count, value)
          })
          count++
        })
        count = count - 1
        console.log(mapPastShops)
      }).then(() => {
        var itemDateArray = Array.from({ length: count }, (v, k) => k + 1)
        console.log('Total Number of past purchases on the left panel is: ' + itemDateArray.length)
        console.log('-----------------')
        let UniqueProductCount, BasketId
        itemDateArray.forEach(async index => {
          if (index === 1) {
            console.log('Purchase: ' + index)
            UniqueProductCount = mapPastShops.get('UniqueProductCount1')
            console.log('Product count on left panel is: ' + UniqueProductCount)
            BasketId = mapPastShops.get('BasketId1')
            console.log('BasketId is: ' + BasketId)
            pastShopsBody.BasketId = BasketId
            pastShopsBody.Location = '/shop/mylists/pastshops/' + BasketId
          }
          await cy.getPastShopsByID(pastShopsBody, BasketId).then((response) => {
            expect(response.status).to.eq(200)
            let data = response.body.TotalRecordCount
            console.log('Product count on the main page is: ' + data)
            expect(UniqueProductCount).to.eq(data)
            console.log('-----------------')
            if (index === count) {
              console.log("Reached last purchase i.e. " + count)
            } else {
              let num = index + 1
              console.log('Purchase: ' + num)
              BasketId = mapPastShops.get('BasketId' + num)
              UniqueProductCount = mapPastShops.get('UniqueProductCount' + num)
              console.log('Product count on left panel is: ' + UniqueProductCount)
              console.log('BasketId is: ' + BasketId)
              pastShopsBody.BasketId = BasketId
              pastShopsBody.Location = '/shop/mylists/pastshops/' + BasketId
            }
          })
        })
      })
    })
  })
})
