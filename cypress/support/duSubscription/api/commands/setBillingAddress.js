Cypress.Commands.add('setBillingAddressViaApi', (billingAddrID) => {
    cy.api({ url: '/' }).then((response) => {
      expect(response.status).to.eq(200)
    })
  
    cy.api({
      method: 'POST',
      url: Cypress.env('setBillingAddressEndpoint'),
      body:{
          "addressId": billingAddrID
      }
     
    }).then((response) => {
      return response
    })
  })