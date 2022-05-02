//
// This class will capture DOM elements on the Two factor authentication page during sign up process
//

export class TwoFactorAuthPageSignUp {
  getEnter6DigitCodeInputElement () {
    return cy.get('#email-verification-code [type]')
  }

  getSendANewCodeLink () {
    return cy.contains('Send a new code')
  }

  getCreateAccountButton () {
    return cy.contains('Create Account')
  }

  getCancelButton () {
    return cy.get('.email-verification-form-btn-cancel.link-underline')
  }

  VerifyCode (code: string) {
    this.getEnter6DigitCodeInputElement().clear().type(code)
    this.getCreateAccountButton().click()
  }
}

export const onTwoStepAuthPageSignUp = new TwoFactorAuthPageSignUp()
