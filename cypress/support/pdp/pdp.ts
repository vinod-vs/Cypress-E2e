import cypress from 'cypress'

Cypress.Commands.add('fetchProductDataOnPDP', (StockCode) => {
  const endPoint = '/' + StockCode + '?isMobile=false'

  cy.api({
    method: 'GET',
    url: Cypress.env('productDetailsEndpoint') + endPoint
  }).then((response: any) => {
    expect(response.status).to.eq(200)
    return response.body
  })
})
