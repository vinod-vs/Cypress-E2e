/* eslint-disable no-unused-expressions */
/// <reference types="cypress" />

/*
  Usage: cy.invoiceSearch('1')
*/
Cypress.Commands.add('invoiceSearch', (pageNumber) => {
  var endpoint = String(Cypress.env('invoicesEndpoint'))
  endpoint = endpoint.replace('PAGE_NUMBER', Number(pageNumber))
    cy.api({
      method: 'GET',
      url: endpoint
    }).then((response) => {
      expect(response.status).to.eq(200)
      return response.body
    })
  })