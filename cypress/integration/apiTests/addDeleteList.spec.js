/// <reference types="cypress" />

import shopper from '../../fixtures/login.json'
import listName from '../../fixtures/listName.json'
import '../../support/api/login/login'
import '../../support/api/list/addList'
import '../../support/api/list/deleteList'

describe('Add a new list, add items in the list and delete the list', () => {
    before(() => {
        cy.clearCookies({ domain: null })
        cy.clearLocalStorage({ domain: null })
    })

    it('Should create a new list, add items in the list and delete the list', () => {
        cy.loginViaApi(shopper.b2c).then((response) => {
            expect(response).to.have.property('LoginResult', 'Success')
        })

        cy.addList(listName).then((response) => {
            expect(response).to.have.property('Message', 'The new list has been created sucessfully')

            cy.wrap(response.ListId).as('listId')
        })

        // TODO: Adding items in the list is in progress

        cy.get('@listId').then(listId => {
            cy.deleteList(listId).then((response) => {
                expect(response.status).to.eq(200)
            })
        })
    })
})