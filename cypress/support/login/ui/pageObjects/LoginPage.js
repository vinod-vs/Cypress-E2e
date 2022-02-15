export class LoginPage {
  getEmailAddress () {
    return cy.get('#loginForm-Email')
  }

  getPassword () {
    return cy.get('#loginForm-Password')
  }

  getLoginButton () {
    return cy.get('.success').contains('Login')
  }
}

export const onLoginPage = new LoginPage()
