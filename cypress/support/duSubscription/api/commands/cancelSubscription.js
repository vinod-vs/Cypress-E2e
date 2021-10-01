// Cancel Personal Delivery Unlimited subscription
Cypress.Commands.add('cancelPerSubscription', (cancelSubscription) => {
  cy.api({ url: '/' }).then((response) => {
    expect(response.status).to.eq(200)
  })
  cy.api({
    method: 'POST',
    url: Cypress.env('duCancelSubscriptionEndpoint'),
    body: cancelSubscription
  }).then((response) => {
    return response
  })
})
