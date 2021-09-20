let productArr

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

  for (const x in response.Products) {
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

export function getAgeRestrictedWowItems (productResponse) {
  const productArr = []

  for (const x in productResponse.Products) {
    const product = productResponse.Products[x].Products[0]
    if (product.IsInStock === true && product.IsAvailable === true &&
      product.IsMarketProduct === false && product.AgeRestricted === true) {
      productArr.push(product)
    }
  }

  return productArr
}

export function getPmRestrictedWowItems (productResponse) {
  const productArr = []

  for (const x in productResponse.Products) {
    const product = productResponse.Products[x].Products[0]
    if (product.IsInStock === true && product.IsAvailable === true && product.IsMarketProduct === false &&
      (product.ProductRestrictionMessage !== null && product.ProductRestrictionMessage.includes('afternoon delivery'))) {
      productArr.push(product)
    }
  }

  return productArr
}

export function getGroupLimitRestrictedWowItems (productResponse) {
  const productArr = []

  for (const x in productResponse.Products) {
    const product = productResponse.Products[x].Products[0]
    if (product.IsInStock === true && product.IsAvailable === true &&
      product.IsMarketProduct === false && product.SupplyLimitSource === 'ProductLimit') {
      productArr.push(product)
    }
  }

  return productArr
}
