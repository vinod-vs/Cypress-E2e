/// <reference types="cypress" />

import b2cShopper from '../../../fixtures/login/b2cLogin.json'
import b2bShopper from '../../../fixtures/login/b2bLogin.json'
import TestFilter from '../../../support/TestFilter'
import allProductsBody from '../../../fixtures/lists/allProducts.json'
import '../../../support/login/api/commands/login'
import '../../../support/lists/api/commands/otherAPIs'

const displayNames = []
let totalRecords
let numOfPages

TestFilter(['API', 'B2C', 'B2B', 'P0'], () => {
  describe('[API] Verify that duplicate products are not displayed on the All Products page', () => {
    before(() => {
      cy.clearCookies({ domain: null })
      cy.clearLocalStorage({ domain: null })
      Cypress.Cookies.preserveOnce('w-rctx')
    })

    it.only('Should verify that duplicate products are not displayed on the All Products page', () => {
      if (Cypress.env('fileConfig') === 'b2c') {
        cy.loginViaApiWith2FA(b2cShopper, Cypress.env('otpValidationSwitch'), Cypress.env('otpStaticCode'))
      } else if (Cypress.env('fileConfig') === 'b2b') {
        cy.loginViaApi(b2bShopper).then((response) => {
          expect(response).to.have.property('LoginResult', 'Success')
        })
      }

      // Set the PageSize to go through each page and retrieve products
      function setNumOfPages () {
        cy.getAllProducts(allProductsBody).then((response) => {
          expect(response.status).to.eq(200)
          totalRecords = response.body.TotalRecordCount
          console.log('Total Number of products is: ' + totalRecords)
          numOfPages = Math.ceil(totalRecords / 45)
          console.log('Total Number of pages is: ' + numOfPages)
        })
      }

      // Go through all the pages and get all the product names
      const getAllPageProds = () => {
        const numOfPagesArray = Array.from({ length: numOfPages }, (v, k) => k + 1)
        numOfPagesArray.forEach(async index => {
          await cy.getAllProducts(allProductsBody).then((response) => {
            expect(response.status).to.eq(200)
            const data = response.body.Items
            console.log('Page: ' + index)
            console.log(data)
            data.forEach(obj => {
              displayNames.push(obj.DisplayName)
              console.log('-----------------')
            })
            if (index === numOfPages) {
              console.log('Reached last page i.e. ' + numOfPages)
              console.log('Total products are: ' + displayNames.length)
            } else {
              allProductsBody.PageNumber = index + 1
            }
          })
        })
        allProductsBody.PageNumber = 1
      }

      // Verify no duplicate products are displayed
      const verifyDuplicates = (arrayToVerify) => {
        const filteredNames = arrayToVerify.filter(Boolean); // remove null or blank values
        console.log(filteredNames)
        const sortedArray = filteredNames.slice().sort();
        const result = [];
        for (let i = 0; i < sortedArray.length - 1; i++) {
          if (sortedArray[i + 1] === sortedArray[i]) {
            result.push(sortedArray[i]);
          }
        }
        if (result.length === 0) {
          console.log('No duplicate products are displayed.')
        } else {
          console.log('There are total ' + result.length + ' duplicate products displayed, they are: ' + result)
        }
      }

      // Call the functions to get all the products and verify duplicates
      setNumOfPages()
      cy.then(() => {
        console.log('Visit each page and capture the product Display Names')
        getAllPageProds()
      }).then(() => {
        console.log(displayNames.length)
        if (displayNames.length === 0) {
          console.log('No display names are captured')
          expect(displayNames).to.be.greaterThan(0)
        } else {
          console.log('Catch the Dopplegangers amongst the following:')
          verifyDuplicates(displayNames)
        }
      })
    })
  })
})
