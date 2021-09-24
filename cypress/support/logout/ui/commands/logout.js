import {onHomePage} from '../../../homePage/ui/pageObjects/HomePage'
import {onMyAccountPage} from '../../../myAccount/ui/pageObjects/MyAccountPage'

Cypress.Commands.add('logoutViaUi', (shopper) => {
  onHomePage.getMyAccount().contains('My Account').click()

  onMyAccountPage.getLogout().contains('Logout').click()

  cy.url().should('eq', Cypress.config().baseUrl)
})
