class LoginPage {

    open() {
      cy.visit('https://adminuatsite.woolworths.com.au/Manage/Login')
    }

    getEmailAddress () {
      return cy.get('#Email')
    }
  
    getPassword () {
      return cy.get('#Password')
    }
  
    getLoginButton () {
      return cy.get('input[value="Login"]')
    }
  }
  
  export const loginPage = new LoginPage()