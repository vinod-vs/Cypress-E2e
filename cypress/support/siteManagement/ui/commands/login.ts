import { loginPage } from '../pageObjects/LoginPage'

Cypress.Commands.add('adminLoginViaUi', (loginDetails) => {
  loginPage.getEmailAddress().type(loginDetails.email)
  loginPage.getPassword().type(loginDetails.password)
  loginPage.getLoginButton().click()
})

Cypress.Commands.add('siteManagementLoginViaUi', (email, password) => {
  cy.visit(Cypress.env('siteManagementUrl'))
  cy.url().should('include', '/Login')
  loginPage.getEmailAddress().type(email)
  loginPage.getPassword().type(password)
  loginPage.getLoginButton().click()
  cy.url().should('not.include', '/Login')
})
