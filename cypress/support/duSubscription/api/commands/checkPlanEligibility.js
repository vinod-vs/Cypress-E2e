Cypress.Commands.add('checkPlanEligibilityViaApi', (shopperId) => {
  cy.api({ url: '/' }).then((response) => {
    expect(response.status).to.eq(200)
  })

  cy.api({
    method: 'GET',
    url: Cypress.env('subscriptionPlanEligibilityEndpoint'),
    qs: {
      serviceType: 'DeliverySaver',
      externalId: shopperId
    }
  }).then((response) => {
    return response
  })
})
