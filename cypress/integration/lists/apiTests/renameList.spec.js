/// <reference types="cypress" />

import b2cShopper from '../../../fixtures/login/b2cLogin.json'
import b2bShopper from '../../../fixtures/login/b2bLogin.json'
import listName from '../../../fixtures/lists/listName.json'
import searchBody from '../../../fixtures/search/productSearch.json'
import listItemBody from '../../../fixtures/lists/addItemToList.json'
import createdListId from '../../../fixtures/lists/listId.json'
import freeTextBody from '../../../fixtures/lists/addFreeTextToList.json'
import removeItemBody from '../../../fixtures/lists/removeItemFromList.json'
import renameListBody from '../../../fixtures/lists/renameList.json'
import TestFilter from '../../../support/TestFilter'
import '../../../support/login/api/commands/login'
import '../../../support/lists/api/commands/addList'
import '../../../support/lists/api/commands/deleteList'
import '../../../support/lists/api/commands/addItemToList'
import '../../../support/search/api/commands/search'
import '../../../support/lists/api/commands/getProductsInList'
import '../../../support/lists/api/commands/removeItemsFromList'
import '../../../support/lists/api/commands/updateList'

const faker = require('faker')

TestFilter(['API', 'B2C', 'B2B', 'P0'], () => {
  describe('[API] Add a new list, add items in the list, add freetext in the list, remove items and remove freetext ', () => {
    before(() => {
      cy.clearCookies({ domain: null })
      cy.clearLocalStorage({ domain: null })
      Cypress.Cookies.preserveOnce('w-rctx')
    })

    it('Should create a new list, add items in the list and delete the list', () => {
      //Login to the application
     if (Cypress.env('fileConfig') === 'b2c') {
        cy.loginViaApi(b2cShopper).then((response) => {
          cy.validate2FALoginStatus(response, Cypress.env('otpValidationSwitch'), Cypress.env('otpStaticCode'))
       })
      } else if (Cypress.env('fileConfig') === 'b2b') {
        cy.loginViaApi(b2bShopper).then((response) => {
          expect(response).to.have.property('LoginResult', 'Success')
        })
    }

      //create a new list
      listName.Name = faker.commerce.productName()
      cy.addList(listName).then((response) => {
        expect(response).to.have.property('Message', 'The new list has been created sucessfully')
        cy.wrap(response.Data.Id).as('listId')
        createdListId.listId = response.ListId
      })

      // searching  an item 
      searchBody.SearchTerm = 'Milk'
      cy.productSearch(searchBody).then((response) => {
        expect(response.SearchResultsCount).to.be.greaterThan(0)
        expect(response.Products[0].Products[0].Stockcode).to.be.greaterThan(0)
        cy.wrap(response.Products[0].Products[0].Stockcode).as('stockCode')
      })

      //Adding the item to the list
      cy.get('@stockCode').then(stockCode => {
        listItemBody.StockCode = stockCode
        cy.get('@listId').then(listId => {
          cy.addItemToList(listId, listItemBody).then((response) => {
            expect(response.status).to.eq(200)
          })
        })
      })

      //Verify if item is added to list
      cy.get('@listId').then(listId => {
        cy.getProductsFromList(listId).then((response) => {
          expect(response.body.Items[0].Stockcode).to.be.eqls(listItemBody.StockCode)
        })
      })

      //renaming the list name and verify if list has been renamed   
      renameListBody.name = 'ListRenamed'
      cy.get('@listId').then(listId => {
        renameListBody.id = listId
        renameListBody.timestamp = Date.now()
        cy.renameList(listId, renameListBody).then((response) => {
          expect(response.body).to.have.property('Message', 'Selected list has been updated sucessfully')
          expect(response.body.Data.Name).to.be.eqls(renameListBody.name)
        })
      })
    })

    after(() => {
      cy.get('@listId').then(listId =>{
      cy.deleteList(listId).then((response) => {
        expect(response.status).to.eq(200)
      })
    })
  })
  })
})
