/// <reference types="cypress" />

import shopper from '../../../fixtures/login/b2cLogin.json'
import listName from '../../../fixtures/lists/listName.json'
import searchBody from '../../../fixtures/search/productSearch.json'
import listItemBody from '../../../fixtures/lists/addItemToList.json'
import createdListId from '../../../fixtures/lists/listId.json'
import TestFilter from '../../../support/TestFilter'
import '../../../support/login/api/commands/login'
import '../../../support/lists/api/commands/addList'
import '../../../support/lists/api/commands/deleteList'
import '../../../support/lists/api/commands/addItemToList'
import '../../../support/search/api/commands/search'
import '../../../support/lists/api/commands/getProductsInList'

const faker = require('faker')

TestFilter(['API'], () => {
  describe('[API] Add a new list, add items in the list and delete the list', () => {
    before(() => {
      cy.clearCookies({ domain: null })
      cy.clearLocalStorage({ domain: null })
    })

    it('Should create a new list, add items in the list and delete the list', () => {
      cy.loginViaApi(shopper).then((response) => {
        expect(response).to.have.property('LoginResult', 'Success')
      })

      listName.Name = faker.commerce.productName()

      cy.addList(listName).then((response) => {
        expect(response).to.have.property('Message', 'The new list has been created sucessfully')

        cy.wrap(response.ListId).as('listId')

        createdListId.listId = response.ListId
      })

      searchBody.SearchTerm = 'A2 Milk'

      cy.productSearch(searchBody).then((response) => {
        expect(response.SearchResultsCount).to.be.greaterThan(0)

        expect(response.Products[0].Products[0].Stockcode).to.be.greaterThan(0)

        cy.wrap(response.Products[0].Products[0].Stockcode).as('stockCode')
      })

      cy.get('@stockCode').then(stockCode => {
        listItemBody.StockCode = stockCode
        cy.get('@listId').then(listId => {
          cy.addItemToList(listId, listItemBody).then((response) => {
            expect(response.status).to.eq(200)
          })
        })
      })

      cy.get('@listId').then(listId => {
        cy.getProductsFromList(listId).then((response) => {
          expect(response.Items[0].Stockcode).to.be.eqls(listItemBody.StockCode)
        })
      })
    })

    after(() => {
      cy.deleteList(createdListId.listId).then((response) => {
        expect(response.status).to.eq(200)
      })
    })
  })
})