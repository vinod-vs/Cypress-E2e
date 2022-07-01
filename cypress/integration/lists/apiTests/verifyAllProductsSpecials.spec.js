/// <reference types="cypress" />

import b2cShopper from '../../../fixtures/login/b2cLogin.json'
import TestFilter from '../../../support/TestFilter'
import allProductsBody from '../../../fixtures/lists/allProducts.json'
import '../../../support/login/api/commands/login'
import '../../../support/lists/api/commands/otherAPIs'

let totalRecords
let data
const arraySpecialProductsBeforeToggle = []
const arraySpecialProductsAfterToggle = []
let numOfPages

TestFilter(['API', 'B2C', 'P0'], () => {
  describe('[API] Verify that only special producuts are displayed on the All Products page when the Specials Only toggle is ON', () => {
    before(() => {
      cy.clearCookies({ domain: null })
      cy.clearLocalStorage({ domain: null })
      Cypress.Cookies.preserveOnce('w-rctx')
    })

    it('Should verify that only special producuts are displayed on the All Products page when the Specials Only toggle is ON', () => {
        cy.loginViaApiWith2FA(b2cShopper, Cypress.env('otpValidationSwitch'), Cypress.env('otpStaticCode'))

      // Set the PageSize to go through each page and store products
      function setPageSize () {
        cy.getAllProducts(allProductsBody).then((response) => {
          expect(response.status).to.eq(200)
          totalRecords = response.body.TotalRecordCount
          console.log('Total Number of products is: ' + totalRecords)
          numOfPages = Math.ceil(totalRecords / 45)
          console.log('Total Number of pages is: ' + numOfPages)
        })
      }

      // Go through all the pages and get all the special product names
      const getProds = (specialProductsArray) => {
        const noOfPagesArray = Array.from({ length: numOfPages }, (v, k) => k + 1)
        console.log(noOfPagesArray)
        noOfPagesArray.forEach(async index => {
          await cy.getAllProducts(allProductsBody).then((response) => {
            expect(response.status).to.eq(200)
            data = response.body.Items
            console.log('Page: ' + index)
            console.log(data)
            data.forEach(obj => {
              if (obj.IsOnSpecial === true) {
                specialProductsArray.push(obj.DisplayName)
              }
              console.log('-----------------')
            })
            if (index === numOfPages) {
              console.log('Reached last page i.e. ' + numOfPages)
              console.log('Total special products are: ' + specialProductsArray.length)
            } else {
              allProductsBody.PageNumber = index + 1
            }
          })
        })
        allProductsBody.PageNumber = 1
      }

      // Compare the products
      const compareProducts = (arrayToCompareTwo, arrayToCompareOne) => {
        let result
        console.log('COMPARING ' + arrayToCompareTwo.length + ' products with other ' + arrayToCompareOne.length)
        const arrayToCompareOneSorted = arrayToCompareOne.slice().sort();
        const arrayToCompareTwoSorted = arrayToCompareTwo.slice().sort();
        console.log(arrayToCompareTwoSorted, arrayToCompareOneSorted)
        result = Cypress._.isEqual(arrayToCompareTwoSorted, arrayToCompareOneSorted)
        console.log('Result: ' + result)
        expect(result).to.eq(true)
      }

      // Call the functions to identify the special products when toggle is OFF
      console.log('Special Toggle is set to OFF')
      setPageSize()
      cy.then(() => {
        console.log('Visit each page and find the special ones')
        getProds(arraySpecialProductsBeforeToggle)
      }).then(() => {
        console.log('-----------------')
        console.log('Set Special Toggle to ON')
        allProductsBody.isSpecial = true
      })

      // Call the functions to identify the special products when toggle is ON and compare both
      setPageSize()
      cy.then(() => {
        console.log('Again visit each page and find the special ones')
        getProds(arraySpecialProductsAfterToggle)
      }).then(() => {
        // console.log(Cypress._.isEqual(arraySpecialProductsAfterToggle, arraySpecialProductsBeforeToggle))
        compareProducts(arraySpecialProductsAfterToggle, arraySpecialProductsBeforeToggle)
      })
    })
  })
})
