import { onLoginPage } from '../pageObjects/LoginPage'
import { onHomePage } from '../../../homePage/ui/pageObjects/HomePage'
import { onDeliveryDateAndWindowPage } from '../../../fulfilment/ui/pageObjects/DeliveryDateAndWindowPage.ts'
import { onTwoStepAuthPage } from '../pageObjects/TwoStepAuthPage'

Cypress.Commands.add('loginViaUi', (shopper) => {
  cy.visit('shop/securelogin', { headers: { "Accept-Encoding": "gzip, deflate" } })

  cy.wait(1000)
  onLoginPage.getEmailAddress().type(shopper.email)

  onLoginPage.getPassword().type(shopper.password)

  onLoginPage.getLoginButton().click()

  if (Cypress.env('otpValidationSwitch') && shopper.type != 'business') {
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
