class LoginPage {
  getEmailAddress () {
    return cy.get('#loginForm-Email')
  }

  getPassword () {
    return cy.get('#loginForm-Password')
  }

  getLoginButton () {
    return cy.get('.primary-legacy')
  }
}

export default LoginPage
