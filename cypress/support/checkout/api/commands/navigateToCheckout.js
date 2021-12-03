Cypress.Commands.add('navigateToCheckout', () => {
  cy.request('GET', Cypress.env('navigateToCheckoutEndpoint')).then((response) => {
    return response.body
  })
})

Cypress.Commands.add('addPromotionCode', (promoCode) => {
  const requestBody = { PromotionCode: promoCode }
  cy.api({
    method: 'POST',
    url: Cypress.env('promotionCodeEndpoint'),
    body: requestBody
  }).then((response) => {
    expect(response.status).to.eq(200)
    return response.body
  })
})

Cypress.Commands.add('removePromotionCode', (promoCode) => {
  const requestBody = { PromotionCode: promoCode }
  cy.api({
    method: 'POST',
    url: Cypress.env('removePromotionCodeEndpoint'),
    body: requestBody
  }).then((response) => {
    expect(response.status).to.eq(200)
    return response.body
  })
})


