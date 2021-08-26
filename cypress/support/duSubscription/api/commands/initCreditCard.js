Cypress.Commands.add('initCreditCardViaApi', () => {
    cy.api({ url: '/' }).then((response) => {
      expect(response.status).to.eq(200)
    })
  
    cy.api({
      method: 'POST',
      url: Cypress.env('initCreditCardEndpoint') 
    }).then((response) => {
      return response
    })
  })