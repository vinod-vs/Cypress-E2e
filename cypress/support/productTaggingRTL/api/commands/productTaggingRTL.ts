Cypress.Commands.add('getRtlOffers', (rtlGetOffersData) => {
  const endpoint = Cypress.env('productTaggingUat') + Cypress.env('productTaggingRtlOffersEndpoint')
  cy.api({
    method: 'POST',
    url: endpoint,
    body: rtlGetOffersData
  }).then((response: any) => {
    expect(response.status).to.eq(200)
    return response.body
  })
})

Cypress.Commands.add('patchRtlUnboost', (rtlPatchData) => {
  const endpoint = Cypress.env('productTaggingUat') + Cypress.env('ProductTaggingUnboostEndpoint')
  cy.api({
    method: 'PATCH',
    url: endpoint,
    body: rtlPatchData
  }).then((response: any) => {
    expect(response.status).to.eq(200)

    return response
  })
})

Cypress.Commands.add('productSearchByStockCode', (searchData) => {
  cy.api({
    method: 'GET',
    url: Cypress.env('productSearchByStockCodeEndpoint'),
    qs: {
      searchTerm: searchData.stockcodes[0]
    }
  }).then((response: any) => {
    expect(response.status).to.eq(200)
  })
})

Cypress.Commands.add('addToCart', (addItemsBody) => {
  cy.api({
    method: 'POST',
    url: Cypress.env('addItemsToTrolleyEndpoint'),
    body: addItemsBody
  }).then((response: any) => {
    expect(response.status).to.eq(200)

    return response.body
  })
})
