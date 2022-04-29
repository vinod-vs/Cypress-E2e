/// <reference types="cypress" />

import shoppers from '../../../fixtures/myAccount/b2bShoppers.json'
import TestFilter from '../../../support/TestFilter'
import '../../../support/myAccount/api/commands/myPaymentMethods'
import '../../../support/login/api/commands/login'

TestFilter(['API', 'B2B', 'P1'], () => {
  describe('[API] My payment methods for eligible B2B shoppers', () => {
    before(() => {
      cy.clearCookies({ domain: null })
      cy.clearLocalStorage({ domain: null })
      Cypress.Cookies.preserveOnce('w-rctx')
    })

    it('My Payment methods for B2B shoppers who is eligible for credit card payments', () => {
      cy.loginViaApi(shoppers[0]).then((response: any) => {
        expect(response).to.have.property('LoginResult', 'Success')
      })

      cy.availableDigitalPaymentInstruments().then((response: any) => {
        expect(response.CreditCard.Instruments[0].PaymentInstrumentId).to.be.not.null
        expect(response.CreditCard).to.have.property('Enabled', true)
      })
    })

    it('My Payment methods for B2B shoppers who is eligible only for Open pay payments', () => {
      cy.loginViaApi(shoppers[1]).then((response: any) => {
        expect(response).to.have.property('LoginResult', 'Success')
      })
      cy.availableDigitalPaymentInstruments().then((response: any) => {
        expect(response.CreditCard.Instruments).to.be.null
        expect(response.CreditCard).to.have.property('Enabled', false)
        expect(response.Openpay).to.have.property('Enabled', true)
      })
    })
  })
})
