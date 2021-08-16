import HomePage from '../../../homePage/ui/pageObjects/HomePage'
import MyAccountPage from '../../../myAccount/ui/pageObjects/MyAccountPage'

const homePage = new HomePage()
const myAccountPage = new MyAccountPage()

Cypress.Commands.add('logoutViaUi', (shopper) => {
  homePage.getMyAccount().contains('My Account').click()

  myAccountPage.getLogout().contains('Logout').click()

  cy.url().should('eq', Cypress.config().baseUrl)
})
