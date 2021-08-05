import LoginPage from '../pageObjects/LoginPage'
import HomePage from '../../../homePage/ui/pageObjects/HomePage'
import MyAccountPage from '../../../myAccount/ui/pageObjects/MyAccountPage'

const login = new LoginPage()
const homePage = new HomePage()
const myAccountPage = new MyAccountPage()

Cypress.Commands.add('loginViaUi', (shopper) => {
  
  let url = ( shopper.platform === 'B2B') ? Cypress.env('b2bUat') + 'shop/securelogin' : 'shop/securelogin'

  cy.visit(url)

  cy.url().should('include', '/securelogin')

  login.getEmailAddress().type(shopper.email)

  login.getPassword().type(shopper.password)

  login.getLoginButton().contains('Login').click()
  
  if(shopper.platform === 'B2C') {
    homePage.getMyAccount().contains('My Account')
  }

  cy.url().should('not.include', '/securelogin')
})

Cypress.Commands.add('logoutViaUi', (shopper) => {
  homePage.getMyAccount().contains('My Account').click()

  myAccountPage.getLogout().contains('Logout').click()

  cy.url().should('eq', Cypress.config().baseUrl)
})
