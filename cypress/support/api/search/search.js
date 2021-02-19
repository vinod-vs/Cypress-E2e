Cypress.Commands.add('apiSearch', (searchTerm) => {
  const searchBody = {
    Filters: [],
    IsSpecial: false,
    PageNumber: 1,
    PageSize: 36,
    SearchTerm: searchTerm,
    SortType: 'TraderRelevance'
  }

  cy.request('POST', Cypress.env('productSearchEndpoint'), searchBody).then((response) => {
    return response.body
  })
})
