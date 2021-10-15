Cypress.Commands.add('getAccessToken', () => {
  cy.api({
    method: 'POST',
    form: true,
    headers: {
      'Content-Type': 'application/x-www-form-urlencoded'
    },
    body: {
      client_id: 'service-shopper-notifications',
      grant_type: 'client_credentials',
      client_secret: '3d8bee98-a04a-421e-b95d-b6d85dd5e327'
    },
    url: Cypress.env('oqsKeyCloakUrl')
  }).then((response) => {
    expect(response.status).to.eq(200)
    return response.body
  })
})

Cypress.Commands.add('obtainPermission', (accessToken) => {
  cy.api({
    method: 'POST',
    form: true,
    headers: {
      'Content-Type': 'application/x-www-form-urlencoded'
    },
    auth: {
      bearer: accessToken
    },
    body: {
      grant_type: 'urn:ietf:params:oauth:grant-type:uma-ticket',
      audience: 'service-orders'
    },
    url: Cypress.env('oqsKeyCloakUrl')
  }).then((response) => {
    expect(response.status).to.eq(200)
    return response.body
  })
})

Cypress.Commands.add('getOrderStatus', (traderOrderId) => {
  let endpoint = Cypress.env('oqsEndpoint') + Cypress.env('oqsGetOrderStatusEndpoint')
  endpoint = endpoint.replace('TRADER_ORDER_ID', traderOrderId)

  // Authentication - Get access token
  cy.getAccessToken().its('access_token').as('accessToken')

  // Authorization - Obtain permissions to the access token
  cy.get('@accessToken').then((accessToken) => {
    cy.obtainPermission(accessToken).its('access_token').as('authorizedAccessToken')
  })

  // Invoke TMO using the authorized access token
  cy.get('@authorizedAccessToken').then((authorizedAccessToken) => {
    cy.api({
      method: 'GET',
      auth: {
        bearer: authorizedAccessToken
      },
      url: endpoint,
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded',
        'Wow-SystemName': 'CypressAutomation'
      }
    }).then((response) => {
      expect(response.status).to.eq(200)
      return response.body
    })
  })
})
