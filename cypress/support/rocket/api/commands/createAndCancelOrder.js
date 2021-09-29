Cypress.Commands.add('createRocketOrderViaApi', (rocketOrderInfo) => {
  cy.api({
    method: 'POST',
    url: Cypress.env('rocketOrderURL'),
    failOnStatusCode: false,
    qs: {
      'api-version': '2.0'
    },
    auth: {
      username: Cypress.env('rocketUserName'),
      password: Cypress.env('rocketPassword')
    },
    body: rocketOrderInfo
  }).then((response) => {
    return response
  })
})

Cypress.Commands.add('cancelRocketOrderViaApi', (rocketOrderInfo, orderID) => {
  cy.api({
    method: 'PATCH',
    url: Cypress.env('rocketOrderURL') + '/' + orderID + '/cancel',
    failOnStatusCode: false,
    qs: {
      'api-version': '2.0'
    },
    auth: {
      username: Cypress.env('rocketUserName'),
      password: Cypress.env('rocketPassword')
    },
    body: rocketOrderInfo
  }).then((response) => {
    return response
  })
})
