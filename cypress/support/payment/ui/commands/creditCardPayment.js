/// <reference types="Cypress" />
/// <reference types="cypress-iframe" />
import 'cypress-iframe'
import CreditCardPage from '../pageObjects/CreditCardPage'
require('cypress-iframe')

const creditCardPage = new CreditCardPage()

Cypress.Commands.add('fillCreditCardPaymentDetails', (creditCard) => {
  // Fill credit card details
  // Expand the credit card payment section if required
  cy.checkIfElementExists(creditCardPage.getCreditCardSectionCollapsedLocatorString()).then((isCreditCardSectionNotCollapsed) => {
    if (isCreditCardSectionNotCollapsed === true) {
      creditCardPage.getCreditCardSectionCollapsed().click()
      cy.wait(Cypress.config('oneSecondWait'))
    }
  })

  // Select credit card iframe and fill the details
  cy.wait(Cypress.config('oneSecondWait'))
  cy.get(creditCardPage.getCreditCardIframeLocatorString()).then($element => {
    const $body = $element.contents().find('body')
    let stripe = cy.wrap($body)
    stripe.find(creditCardPage.getCreditCardNumberLocatorString()).click().type(creditCard.creditCardNumber)
    stripe = cy.wrap($body)
    stripe.find(creditCardPage.getCreditCardExpMonthLocatorString()).click().type(creditCard.creditCardExpMonth)
    stripe = cy.wrap($body)
    stripe.find(creditCardPage.getCreditCardExpYearLocatorString()).click().type(creditCard.creditCardExpYear)
    stripe = cy.wrap($body)
    stripe.find(creditCardPage.getCreditCardCVVLocatorString()).click().type(creditCard.creditCardCVV)
    stripe = cy.wrap($body)
  })
})
