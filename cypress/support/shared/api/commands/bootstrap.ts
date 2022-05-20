Cypress.Commands.add('getBootstrapResponse', () => {
  cy.api({
    method: 'GET',
    url: Cypress.env('bootstrapEndpoint')
  }).then((response: any) => {
    return response.body
  })
})

Cypress.Commands.add('getUnavailableStockCodes', () => {
  const unavailableStockcodes: number[] = []

  cy.getBootstrapResponse().then(($bootstrap: any) => {
    const unavailableItemsArr: any[] = $bootstrap.TrolleyRequest.UnavailableItems
    if (unavailableItemsArr.length === 0) {
      return unavailableStockcodes
    } else {
      return unavailableItemsArr.filter((item: { Stockcode: number }) => unavailableStockcodes.push(item.Stockcode))
    }
  })
})
