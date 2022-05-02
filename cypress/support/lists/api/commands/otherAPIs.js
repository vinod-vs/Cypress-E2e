// Pastshops, All Products and Suggested Lists
Cypress.Commands.add('getPastShops', () => {
  cy.api({
    method: 'GET',
    url: Cypress.env('listPastShops')
  }).then((response) => {
    return response
  })
})

Cypress.Commands.add('getPastShopsByID', (pastShopsBody, basketId) => {
  // console.log(basketId)
  cy.api({
    method: 'POST',
    url: Cypress.env('listPastShops') + basketId + '/products',
    body: pastShopsBody
  }).then((response) => {
    return response
  })
})

Cypress.Commands.add('getAllProducts', (allProductsBody) => {
  cy.api({
    method: 'POST',
    url: Cypress.env('listPastShops') + 'AllProducts',
    body: allProductsBody
  }).then((response) => {
    return response
  })
})

Cypress.Commands.add('getSuggestedLists', () => {
  cy.api({
    method: 'GET',
    url: Cypress.env('suggestedLists')
  }).then((response) => {
    return response
  })
})

Cypress.Commands.add('setSpecialsOnlyToggle', (specialsOnlyBody) => {
  cy.api({
    method: 'POST',
    url: Cypress.env('specialsOnlyList'),
    body: specialsOnlyBody
  }).then((response) => {
    return response
  })
})

Cypress.Commands.add('setCategoriseCheckbox', (specialsOnlyBody) => {
  cy.api({
    method: 'POST',
    url: Cypress.env('categorisedCheckbox'),
    body: specialsOnlyBody
  }).then((response) => {
    return response
  })
})