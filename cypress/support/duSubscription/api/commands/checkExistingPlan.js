Cypress.Commands.add('checkExistingPlanViaApi', (shopperId) => {
  cy.api({ url: '/' }).then((response) => {
    expect(response.status).to.eq(200)
  })

  cy.api({
    method: 'GET',
    url: Cypress.env('existingSubscriptionPlanEndpoint'),
    qs: {
      serviceType: 'DeliverySaver',
      externalId: shopperId
    }
  }).then((response) => {
    return response
  })
})
