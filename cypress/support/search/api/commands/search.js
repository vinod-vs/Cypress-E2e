Cypress.Commands.add('productSearch', (searchBody) => {
  cy.api({
    method: 'POST',
    url: Cypress.env('productSearchEndpoint'),
    body: searchBody
  }).then((response) => {
    return cy.wrap(response.body)
  })
})

Cypress.Commands.add('findAvailableNonRestrictedWowItems', (response) => {
  const productArr = []
  let x

  for (x in response.Products) {
    if (response.Products[x].Products[0].Price !== null &&
      response.Products[x].Products[0].IsInStock === true &&
      response.Products[x].Products[0].ProductRestrictionMessage === null &&
      response.Products[x].Products[0].ProductWarningMessage === null &&
      response.Products[x].Products[0].IsMarketProduct === false) {
      productArr.push(response.Products[x].Products[0])
    }
  }

  return productArr
})
