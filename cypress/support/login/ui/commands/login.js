import LoginPage from '../pageObjects/LoginPage'
import HomePage from '../../../homePage/ui/pageObjects/HomePage'
import DeliveryDateAndWindowPage from '../../../fulfilment/ui/pageObjects/DeliveryDateAndWindowPage'

const login = new LoginPage()
const homePage = new HomePage()
const deliveryDateAndWindowPage = new DeliveryDateAndWindowPage()

Cypress.Commands.add('loginViaUi', (shopper) => {
  cy.visit('shop/securelogin')

  cy.url().should('include', '/securelogin')

  login.getEmailAddress().type(shopper.email)

  login.getPassword().type(shopper.password)

  login.getLoginButton().click()

  if (shopper.platform === 'B2C') {
    homePage.getMyAccount().contains('My Account')
  } else if (shopper.platform === 'B2B') {
    deliveryDateAndWindowPage.getWowfulfilmentMethodContainer().should('be.visible')
  } else {
    expect(shopper.platform).to.be.oneOf(['B2B', 'B2C'])
  }

  cy.url().should('not.include', '/securelogin')
})
