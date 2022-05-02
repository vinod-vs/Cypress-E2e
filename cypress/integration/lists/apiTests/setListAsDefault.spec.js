/// <reference types="cypress" />

import b2cShopper from '../../../fixtures/login/b2cLogin.json'
import b2bShopper from '../../../fixtures/login/b2bLogin.json'
import listName from '../../../fixtures/lists/listName.json'
import listItemBody from '../../../fixtures/lists/addItemToList.json'
import createdListId from '../../../fixtures/lists/listId.json'
import TestFilter from '../../../support/TestFilter'
import '../../../support/login/api/commands/login'
import '../../../support/lists/api/commands/addList'
import '../../../support/lists/api/commands/deleteList'
import '../../../support/lists/api/commands/addItemToList'
import '../../../support/search/api/commands/search'
import '../../../support/lists/api/commands/getProductsInList'
import '../../../support/lists/api/commands/updateList'

const faker = require('faker')
var BreakException = {}

TestFilter(['API', 'B2C', 'B2B', 'P0'], () => {
  describe('[API] Add a new list and set the list as default', () => {
    before(() => {
      cy.clearCookies({ domain: null })
      cy.clearLocalStorage({ domain: null })
      Cypress.Cookies.preserveOnce('w-rctx')
    })

    it('Should create a new list and set the list as default', () => {
      if (Cypress.env('fileConfig') === 'b2c') {
        cy.loginViaApi(b2cShopper).then((response) => {
          cy.validate2FALoginStatus(response, Cypress.env('otpValidationSwitch'), Cypress.env('otpStaticCode'))
        })
      } else if (Cypress.env('fileConfig') === 'b2b') {
        cy.loginViaApi(b2bShopper).then((response) => {
          expect(response).to.have.property('LoginResult', 'Success')
        })
      }

      listName.Name = faker.commerce.productName()
      cy.addList(listName).then((response) => {
        expect(response).to.have.property('Message', 'The new list has been created sucessfully')
        cy.wrap(response.Data.Id).as('listId')
        createdListId.listId = response.Data.Id
      })

      cy.get('@listId').then(listId => {
        cy.addItemToList(listId, listItemBody).then((response) => {
          expect(response.status).to.eq(200)
        })
      })

      cy.get('@listId').then(listId => {
        cy.setListAsDefault(listId).then((response) => {
          expect(response.body).to.have.property('Message', 'Selected list has been set as default successfully')
        })
      })

      cy.getLists().then((response) => {
        const data = response.body.Response
        try {
          data.forEach(obj => {
            console.log(obj)
            if (obj.IsDefault === true) {
              console.log('Default list found, comparing ids')
              expect(obj.Id).to.eq(createdListId.listId)
              console.log('Success')
              throw BreakException
            }
          })
        } catch (e) {
          if (e !== BreakException) throw e
        }
      })
    })
  })

  after(() => {
    cy.deleteList(createdListId.listId).then((response) => {
      expect(response.status).to.eq(200)
    })
  })
})
