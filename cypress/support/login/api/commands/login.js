import '../../../../../cypress/support/signUp/api/commands/signUp'

Cypress.Commands.add('loginViaApi', (shopper) => {
  cy.api({
    method: 'POST',
    url: Cypress.env('loginEndpoint'),
    body: shopper
  }).then((response) => {
    return response.body
  })
})

Cypress.Commands.add('loginWithNewShopperViaApi', () => {
  cy.setSignUpDetails().then((signUpDetails) => {
    const shopper = {
      "email": signUpDetails.emailAddress,
      "password": signUpDetails.password
    }
    cy.signUpViaApi(signUpDetails).then((response) => {
      cy.wrap(response.body.ShopperId).as('shopperId')
      cy.log('Shopper Id is: ' + response.body.ShopperId)
      cy.loginViaApi(shopper).then((response) => {
        return response.body
      })
    })
  })
})
