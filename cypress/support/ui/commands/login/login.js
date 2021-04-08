import LoginPage from '../../pageObjects/login/LoginPage';
import HomePage from '../../pageObjects/homePage/HomePage';
import MyAccountPage from '../../pageObjects/myAccount/MyAccountPage';

const login = new LoginPage();
const homePage = new HomePage();
const myAccountPage = new MyAccountPage();

Cypress.Commands.add('loginViaUi', (shopper) => {
  cy.visit('shop/securelogin')

  cy.url().should('include', '/securelogin')

  login.getEmailAddress().type(shopper.email)

  login.getPassword().type(shopper.password)

  login.getLoginButton().click()

  homePage.getMyAccount().contains('My Account')

  cy.url().should('not.include', '/securelogin')
})

Cypress.Commands.add('logoutViaUi', (shopper) => {
  homePage.getMyAccount().contains('My Account').click()

  myAccountPage.getLogout().contains('Logout').click()

  cy.url().should('eq', Cypress.config().baseUrl)
})