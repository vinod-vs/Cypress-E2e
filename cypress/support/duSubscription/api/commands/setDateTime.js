//command to set the Next Billing Date after Personal Delivery Unlimited subscription is cancelled for a user
Cypress.Commands.add('setDateTime', (nextBillingDate) => {
    cy.api({ url: '/' }).then((response) => {
      expect(response.status).to.eq(200)
    })
      cy.api({
        method: 'POST',
        url: Cypress.env('setSystemDateEndpoint'),
        body: nextBillingDate
      }).then((response) => {
        return response
      })
    })
  