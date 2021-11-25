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

Cypress.Commands.add('postOneTimePasswordRequest', (oneTimePassword) => {
  cy.api({
    method: 'POST',
    url: Cypress.env('otpEndpoint'),
    body: {
      OneTimePin: oneTimePassword,
      UpdatePrimaryContact: null,
    },
  }).then((response) => {
    return response.body
  })
})

Cypress.Commands.add('validate2FALoginStatus', (userCredentialLoginResponse, otpValidationSwitch, otpCode) => {
  if(otpValidationSwitch) {
    expect(userCredentialLoginResponse).to.have.property('LoginResult', 'PartialSuccess')
    cy.postOneTimePasswordRequest(otpCode).then((otpAuthResponse) => {
      expect(otpAuthResponse).to.have.property('Successful', true)
    })
  }
  else{
    expect(userCredentialLoginResponse).to.have.property('LoginResult', 'Success')
  }
  cy.getCookie('w-rctx').should('exist')
})
