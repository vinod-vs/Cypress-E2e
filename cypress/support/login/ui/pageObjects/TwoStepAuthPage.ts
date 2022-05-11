export class TwoFactorAuthPage {
  getTwoFactorAuthSubTitle () {
    return cy.get('[class*="twoFactorAuth-subTitle verify"]')
  }

  getEnter6DigitCodeInputElement () {
    return cy.get('.twoFactorAuthVerify-codeInput input')
  }

  getSendANewCodeLink () {
    return cy.contains('Send a new code')
  }

  getEmailMeTheCodeInsteadLink () {
    return cy.contains('Email me the code instead')
  }

  getSMSMeTheCodeInsteadLink () {
    return cy.contains('SMS me the code instead')
  }

  getVerifyButton () {
    return cy.get('.twoFactorAuth-verifyButton')
  }

  getCancelButton () {
    return cy.get('.twoFactorAuth-cancelButton')
  }

  EmailMeANewCode () {
    this.getTwoFactorAuthSubTitle().then(subTitle => {
      if (subTitle.text().includes('.com.au')) {
        this.getSendANewCodeLink().click()
      } else {
        this.getEmailMeTheCodeInsteadLink().click()
      }
    })
  }

  VerifyCode (code: string) {
    this.getEnter6DigitCodeInputElement().clear().type(code)
    this.getVerifyButton().click()
  }
}

export const onTwoStepAuthPage = new TwoFactorAuthPage()
