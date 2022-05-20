export class LoginPage {
  getLoginLink () {
    return cy.get('button').contains('Login')
  }

  getEmailAddress () {
    return cy.get('#loginForm-Email')
  }

  getPassword () {
    return cy.get('#loginForm-Password')
  }

  getLoginButton () {
    return cy.get('button').contains('Login')
  }
}

export const onLoginPage = new LoginPage()
