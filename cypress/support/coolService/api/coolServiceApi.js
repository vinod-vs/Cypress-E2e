Cypress.Commands.add('getCountryOfOrigin', () => {

  let stockcode=405010; // Need be updated with more stockcodes
  let code="HpEM1cUoXOzjTBWdT2lM13SoeMfRQa2IrwOMnNddbQNH6aaITeCI6A=="; 

    cy.request('GET', Cypress.env('coolServiceEndpoint') + "&" + stockcode + "&" + code).then((response) => {
      return response.body
    })
  })
