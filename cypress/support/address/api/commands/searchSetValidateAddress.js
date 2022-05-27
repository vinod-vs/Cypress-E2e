Cypress.Commands.add('searchBillingAddressViaApi', (billingAddress) => {
  cy.api({
    method: 'POST',
    url: Cypress.env('addressSearchEndpoint'),
    body: {
      Search: billingAddress
    }
  }).then((response) => {
    expect(response.status, 'Billing Address search endpoint response').to.eql(200)
    return response
  })
})

Cypress.Commands.add('setBillingAddressViaApi', (billingAddrID) => {
  cy.api({
    method: 'POST',
    url: Cypress.env('setBillingAddressEndpoint'),
    body: {
      addressId: billingAddrID
    }
  }).then((response) => {
    expect(response.status, 'Set Billing Address endpoint response').to.eql(200)
    return response
  })
})

Cypress.Commands.add('validateBillingAddressViaApi', () => {
  cy.api({ url: '/' }).then((response) => {
    expect(response.status).to.eq(200)
  })

  cy.api({
    method: 'GET',
    url: Cypress.env('addressEndpoint')

  }).then((response) => {
    return response
  })
})
