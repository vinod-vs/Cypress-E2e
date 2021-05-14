Cypress.Commands.add('getProductsFromList', (listId) => {
  const queryParams = {
    Location: 'shop/mylists/' + listId,
    PageNumber: 1,
    SortType: 'Aisle',
    PageSize: 72,
    Filters: []
  }

  const queryString = Object.keys(queryParams).map(key => key + '=' + queryParams[key]).join('&')

  cy.api({
    method: 'GET',
    url: Cypress.env('myListsEndPoint') + listId + '/products' + '?' + queryString
  }).then((response) => {
    return response.body
  })
})
