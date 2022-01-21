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
    if (Cypress.env('otpValidationSwitch')) {
      cy.signUpViaApiWith2FA(signUpDetails).then((response) => {
        expect(response.status).to.eq(200)
        expect(response.body).to.not.have.property('ShopperId', 0)
        cy.log('Shopper Id is: ' + response.body.ShopperId)
        cy.wrap(response.body).as('signUpResponse')
      })
    } else {
      cy.signUpViaApi(signUpDetails).then((response) => {
        cy.log('Shopper Id is: ' + response.body.ShopperId)
      })
    }

    const shopperDetails = {
      email: signUpDetails.emailAddress,
      password: signUpDetails.password
    }

    cy.log('Shopper details: ' + JSON.stringify(shopperDetails))
    cy.loginViaApiAndHandle2FA(shopperDetails)
  })
})

Cypress.Commands.add('postOneTimePasswordRequest', (oneTimePassword) => {
  cy.api({
    method: 'POST',
    url: Cypress.env('otpEndpoint'),
    body: {
      OneTimePin: oneTimePassword,
      UpdatePrimaryContact: null
    }
  }).then((response) => {
    return response.body
  })
})

// this is only for B2C at the moment
Cypress.Commands.add('loginViaApiWith2FA', (shopper, otpValidationSwitch, otpCode) => {
  cy.loginViaApi(shopper).then((response) => {
    cy.validate2FALoginStatus(response, otpValidationSwitch, otpCode)
  })
})

// this is only for B2C at the moment
Cypress.Commands.add('validate2FALoginStatus', (userCredentialLoginResponse, otpValidationSwitch, otpCode) => {
  if (otpValidationSwitch) {
    expect(userCredentialLoginResponse).to.have.property('LoginResult', 'PartialSuccess')
    cy.postOneTimePasswordRequest(otpCode).then((otpAuthResponse) => {
      expect(otpAuthResponse).to.have.property('Successful', true)
    })
  } else {
    expect(userCredentialLoginResponse).to.have.property('LoginResult', 'Success')
  }
  cy.getCookie('w-rctx').should('exist')
})

Cypress.Commands.add('loginViaApiAndHandle2FA', (shopper) => {
  cy.api({
    method: 'POST',
    url: Cypress.env('loginEndpoint'),
    body: shopper
  }).as('loginResponse').then((response) => {
    expect(response.status).to.eq(200)
  })

  cy.get('@loginResponse').then((loginResponse) => {
    if (loginResponse.body.LoginResult === 'PartialSuccess') {
      cy.log('LoginResult was ' + loginResponse.body.LoginResult + '. Handling 2FA with code ' + Cypress.env('otpStaticCode'))
      cy.postOneTimePasswordRequest(Cypress.env('otpStaticCode')).then((otpAuthResponse) => {
        expect(otpAuthResponse.body).to.have.property('Successful', true)
        expect(otpAuthResponse.status).to.eq(200)
      })
    } else {
      cy.log('LoginResult was ' + loginResponse.body.LoginResult + '. 2FA not required.')
      expect(loginResponse.body).to.have.property('LoginResult', 'Success')
    }
    cy.getCookie('w-rctx').should('exist')
  })
})
