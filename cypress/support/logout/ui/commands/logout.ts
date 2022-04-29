import { onHomePage } from '../../../homePage/ui/pageObjects/HomePage'
import { onMyAccountPage } from '../../../myAccount/ui/pageObjects/MyAccountPage'

Cypress.Commands.add('logoutViaUi', (shopper) => {
  if (shopper.platform === 'B2C') {
    onHomePage.getB2BMyAccount().contains('My Account').click()
  } else
  if (shopper.platform === 'B2B') {
    onHomePage.getB2BMyAccount().contains('My Account').click()
  } else { onHomePage.getMyAccount().contains('My Account').click() }

  onMyAccountPage.getLeftNavigationMenu().contains('Logout').click()

  cy.url().should('eq', Cypress.config().baseUrl)
})
