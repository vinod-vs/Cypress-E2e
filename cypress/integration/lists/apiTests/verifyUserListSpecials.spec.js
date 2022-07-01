/// <reference types="cypress" />

import b2cShopper from '../../../fixtures/login/b2cLogin.json'
import TestFilter from '../../../support/TestFilter'
import listName from '../../../fixtures/lists/listName.json'
import searchBody from '../../../fixtures/search/productSearch.json'
import specialSearchBody from '../../../fixtures/search/specialSearch.json'
import listItemBody from '../../../fixtures/lists/addItemToList.json'
import createdListId from '../../../fixtures/lists/listId.json'
import '../../../support/login/api/commands/login'
import '../../../support/lists/api/commands/otherAPIs'
import '../../../support/lists/api/commands/addList'
import '../../../support/lists/api/commands/addItemToList'
import '../../../support/lists/api/commands/deleteList'
import '../../../support/lists/api/commands/getProductsInList'
import '../../../support/search/api/commands/search'

const faker = require('faker')

let data
const arraySpecialProductsBeforeToggle = []
const arraySpecialProductsAfterToggle = []
const BreakException = {}

TestFilter(['API', 'B2C', 'P0'], () => {
  describe('[API] Verify that only special producuts are displayed on the User Generated List page when the Specials Only toggle is ON', () => {
    before(() => {
      cy.clearCookies({ domain: null })
      cy.clearLocalStorage({ domain: null })
      Cypress.Cookies.preserveOnce('w-rctx')
    })

    it('Should verify that only special producuts are displayed on the User Generated List page when the Specials Only toggle is ON', () => {
      cy.loginViaApiWith2FA(b2cShopper, Cypress.env('otpValidationSwitch'), Cypress.env('otpStaticCode'))

      listName.Name = faker.commerce.productName()

      // Create a list and capture the listId
      cy.addList(listName).then((response) => {
        expect(response).to.have.property('Message', 'The new list has been created sucessfully')
        cy.wrap(response.Data.Id).as('listId')
        createdListId.listId = response.Data.Id
      })

      // Add item to list
      const addTolist = () => {
        cy.get('@stockCode').then(stockCode => {
          listItemBody.StockCode = stockCode
          cy.get('@listId').then(listId => {
            cy.addItemToList(listId, listItemBody).then((response) => {
              expect(response.status).to.eq(200)
            })
          })
        })
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

      // Search products by providing search term and capture the first one
      searchBody.SearchTerm = 'Milk'
      cy.productSearch(searchBody).then((response) => {
        expect(response.SearchResultsCount).to.be.greaterThan(0)
        expect(response.Products[0].Products[0].Stockcode).to.be.greaterThan(0)
        cy.wrap(response.Products[0].Products[0].Stockcode).as('stockCode')
      }).then(() => {
        addTolist()
        // Set search term and location for special product search
        specialSearchBody.SearchTerm = 'Coffee'
        specialSearchBody.Location = '/shop/search/specials?searchTerm=Coffee'
      })

      // Search special product and capture the first one
      cy.specialSearch(specialSearchBody).then((response) => {
        expect(response.SearchResultsCount).to.be.greaterThan(0)
        const data = response.Products
        try {
          data.forEach(obj => {
            if (obj.IsOnSpecial === true) {
              cy.wrap(obj.Stockcode).as('stockCode')
              throw BreakException
            }
          })
        } catch (e) {
          if (e !== BreakException) {
throw e
}
        }
      }).then(() => {
        addTolist()
      })

      // Special toggle is set OFF- Get all the products from the list and store the special products in a array
      cy.get('@listId').then(listId => {
        cy.getProductsFromList(listId).then((response) => {
          expect(response.status).to.eq(200)
          data = response.body.Items
          data.forEach(obj => {
            if (obj.IsOnSpecial === true) {
              arraySpecialProductsBeforeToggle.push(obj.DisplayName)
            }
          })
        })
      }).then(() => {
        // Set the Special toggle to ON and get all the products from the list and store them in a array
        cy.get('@listId').then(listId => {
          const queryParams = {
            Location: 'shop/mylists/' + listId,
            PageNumber: 1,
            SortType: 'Aisle',
            isSpecial: true,
            PageSize: 72,
            Filters: []
          }
          cy.getProductsFromListSpecialToggle(listId, queryParams).then((response) => {
            expect(response.status).to.eq(200)
            data = response.body.Items
            data.forEach(obj => {
              if (obj.IsOnSpecial === true) {
                arraySpecialProductsAfterToggle.push(obj.DisplayName)
              }
            })
            compareProducts(arraySpecialProductsAfterToggle, arraySpecialProductsBeforeToggle)
          })
        })
      })
    })

    after(() => {
      cy.get('@listId').then(listId => {
        cy.deleteList(listId).then((response) => {
          expect(response.status).to.eq(200)
        })
      })
    })
  })
})
