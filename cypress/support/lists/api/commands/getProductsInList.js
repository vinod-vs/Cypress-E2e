Cypress.Commands.add('getProductsFromList', (listId) => {
  const queryParams = {
    Location: 'shop/mylists/' + listId,
    PageNumber: 1,
    SortType: 'Aisle',
    PageSize: 72,
    Filters: [],
    isSpecial: false
  }
  const queryString = Object.keys(queryParams).map(key => key + '=' + queryParams[key]).join('&')
  cy.api({
    method: 'GET',
    url: Cypress.env('myListsEndPointV1') + listId + '/products' + '?' + queryString
  }).then((response) => {
    return response
  })
})

Cypress.Commands.add('getProductsFromListPage', (listId, pageNumber) => {
  const queryParams = {
    Location: 'shop/mylists/' + listId,
    PageNumber: pageNumber,
    SortType: 'Aisle',
    PageSize: 72,
    Filters: [],
    isSpecial: false
  }
  const queryString = Object.keys(queryParams).map(key => key + '=' + queryParams[key]).join('&')
  cy.api({
    method: 'GET',
    url: Cypress.env('myListsEndPointV1') + listId + '/products' + '?' + queryString
  }).then((response) => {
    return response
  })
})

Cypress.Commands.add('getFreeTextFromList', (listId) => {
  cy.api({
    method: 'GET',
    url: Cypress.env('myListsEndPointV1') + listId + '/freetexttags'

  }).then((response) => {
    return response
  })
})

Cypress.Commands.add('getProductsFromListSpecialToggle', (listId, queryParams) => {
  const queryString = Object.keys(queryParams).map(key => key + '=' + queryParams[key]).join('&')
  cy.api({
    method: 'GET',
    url: Cypress.env('myListsEndPointV1') + listId + '/products' + '?' + queryString
  }).then((response) => {
    return response
  })
})

Cypress.Commands.add('getLists', () => {
  cy.api({
    method: 'GET',
    url: Cypress.env('myListsEndPointV3')
  }).then((response) => {
    return response
  })
})