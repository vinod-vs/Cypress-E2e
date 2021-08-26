Cypress.Commands.add('searchBillingAddressViaApi', () => {
    cy.api({ url: '/' }).then((response) => {
      expect(response.status).to.eq(200)
    })
  
    cy.api({
      method: 'POST',
      url: Cypress.env('searchBillingAddressEndpoint'),
      body:{
          "Search": Cypress.env('billingAddress')
      }
     
    }).then((response) => {
      return response
    })
  })