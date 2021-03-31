/// <reference types="cypress" />

import shopper from '../../fixtures/login.json'
import listName from '../../fixtures/listName.json'
import searchBody from '../../fixtures/productSearch.json'
import listItemBody from '../../fixtures/addItemToList.json'
import createdListId from '../../fixtures/listId.json'
import '../../support/api/login/login'
import '../../support/api/list/addList'
import '../../support/api/list/deleteList'
import '../../support/api/list/addItemToList'
import '../../support/api/search/search'
import '../../support/api/list/getProductsInList'

const faker = require('faker')

describe('Add a new list, add items in the list and delete the list', () => {
  before(() => {
    cy.clearCookies({ domain: null })
    cy.clearLocalStorage({ domain: null })
  })

  it('Should create a new list, add items in the list and delete the list', () => {
    cy.loginViaApi(shopper.b2c).then((response) => {
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
