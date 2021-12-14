import { onLoginPage } from '../pageObjects/LoginPage'
import { onHomePage } from '../../../homePage/ui/pageObjects/HomePage'
import { onDeliveryDateAndWindowPage } from '../../../fulfilment/ui/pageObjects/DeliveryDateAndWindowPage.ts'
import { onTwoStepAuthPage } from '../pageObjects/TwoStepAuthPage'

Cypress.Commands.add('loginViaUi', (shopper, validation2FA) => {
  cy.visit('shop/securelogin')

  cy.url().should('include', '/securelogin')

  onLoginPage.getEmailAddress().type(shopper.email)

  onLoginPage.getPassword().type(shopper.password)

  onLoginPage.getLoginButton().click()

  if(validation2FA && shopper.type != 'business'){
    onTwoStepAuthPage.VerifyCode(Cypress.env('otpStaticCode'))
  }

  if (shopper.platform === 'B2C') {
    onHomePage.getMyAccount().contains('My Account')
  } else if (shopper.platform === 'B2B') {
    onDeliveryDateAndWindowPage.getWowfulfilmentMethodContainer().should('be.visible')
  } else {
    expect(shopper.platform).to.be.oneOf(['B2B', 'B2C'])
  }

  cy.url().should('not.include', '/securelogin')
})
