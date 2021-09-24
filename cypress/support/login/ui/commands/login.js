import { onLoginPage } from '../pageObjects/LoginPage'
import { onHomePage } from '../../../homePage/ui/pageObjects/HomePage'
import { onDeliveryDateAndWindowPage } from '../../../fulfilment/ui/pageObjects/DeliveryDateAndWindowPage'

Cypress.Commands.add('loginViaUi', (shopper) => {
  cy.visit('shop/securelogin')

  cy.url().should('include', '/securelogin')

  onLoginPage.getEmailAddress().type(shopper.email)

  onLoginPage.getPassword().type(shopper.password)

  onLoginPage.getLoginButton().click()

  if (shopper.platform === 'B2C') {
    onHomePage.getMyAccount().contains('My Account')
  } else if (shopper.platform === 'B2B') {
    onDeliveryDateAndWindowPage.getWowfulfilmentMethodContainer().should('be.visible')
  } else {
    expect(shopper.platform).to.be.oneOf(['B2B', 'B2C'])
  }

  cy.url().should('not.include', '/securelogin')
})
