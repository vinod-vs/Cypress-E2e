Cypress.Commands.add('getCountryOfOrigin', (coolServiceData) => {

    cy.api({
      method : 'GET', 
      url: Cypress.env('coolServiceEndpoint'),
      qs: {
        stockCode: coolServiceData.stockCode,
        code: coolServiceData.code
      }
    }).then((response: any) => {
      expect(response.status).to.eq(200)

      return response.body
    })
  })
