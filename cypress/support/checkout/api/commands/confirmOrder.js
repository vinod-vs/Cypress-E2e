Cypress.Commands.add('confirmOrder', (confirmOrderParameter) => {
  const queryParams = {
    OrderId: confirmOrderParameter.placedOrderId
  }

  const queryString = Object.keys(queryParams).map(key => key + '=' + queryParams[key]).join('&')

  cy.request('GET', Cypress.env('confirmOrderEndpoint') + '?' + queryString).then((response) => {
    expect(response.status, 'Confirm Order endpoint response status').to.eql(200)
    return response.body
  })
})
