Cypress.Commands.add('validateBillingAddressViaApi', () => {
    cy.api({ url: '/' }).then((response) => {
      expect(response.status).to.eq(200)
    })
  
    cy.api({
      method: 'GET',
      url: Cypress.env('validateBillingAddressEndpoint')
     
    }).then((response) => {
      return response
    })
  })