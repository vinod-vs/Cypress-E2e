Cypress.Commands.add('redeemRewardsDollars', (amount) => {
  const requestBody = { Amount: amount }

  cy.api({
    method: 'POST',
    url: Cypress.env('checkoutRedeemRewardsDollarsEndpoint'),
    body: requestBody
  }).then((response) => {
    expect(response.status).to.eq(200)
    return response.body
  })
})

Cypress.Commands.add('redeemRewardsCredits', (value) => {
  const requestBody = { Value: value }
  cy.api({
    method: 'POST',
    url: Cypress.env('redeemRewardsCreditsEndpoint'),
    body: requestBody
  }).then((response) => {
    expect(response.status).to.eq(200)
    return response.body
  })
})
