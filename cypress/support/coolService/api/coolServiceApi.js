Cypress.Commands.add('getCountryOfOrigin', (CountryOfOrginBody) => {
    cy.request('GET', Cypress.env('coolServiceEndpoint'), CountryOfOrginBody).then((response) => {
      return response.body
    })
  })
  
