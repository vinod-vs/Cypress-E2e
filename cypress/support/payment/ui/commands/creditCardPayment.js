/// <reference types="Cypress" />
/// <reference types="cypress-iframe" />
import 'cypress-iframe'
require('cypress-iframe');
import CreditCardPage from '../pageObjects/CreditCardPage'
import PayPalPage from '../pageObjects/PayPalPage'

const creditCardPage = new CreditCardPage()
const payPalPage = new PayPalPage()

Cypress.Commands.add('selectPayPalPaymentMode', (creditCard) => {

    cy.checkIfElementExists(payPalPage.getPayPalSelectionStatusLocatorString()).then((paypalAlreadySelected) => {
        if (paypalAlreadySelected == false) {
            cy.log('Paypal not selected. Selecting now.')
            cy.get(payPalPage.getPayPalSelectionLocatorString()).click()
            cy.wait(Cypress.config('oneSecondWait'))
            cy.get(payPalPage.getPayPalSelectedLocatorString()).should('be.visible')
        } else {
            cy.log('Paypal already selected.')
        }
    })
})
Cypress.Commands.add('fillCreditCardPaymentDetails', (creditCard) => {
    // Fill credit card details
    // Expand the credit card payment section if required
    cy.checkIfElementExists(creditCardPage.getCreditCardSectionCollapsedLocatorString()).then((isCreditCardSectionNotCollapsed) => {
        if (isCreditCardSectionNotCollapsed == true) {
            creditCardPage.getCreditCardSectionCollapsed().click()
            cy.wait(Cypress.config('oneSecondWait'))
        }
    })

    //If credit card details is already there, just fill the CVV
    cy.checkIfElementExists(creditCardPage.getCreditCardDetailAlreadySavedLocatorString()).then((cardDetailsAlreadyFilled) => {
        cy.log('cardDetailsAlreadyFilled: ' + cardDetailsAlreadyFilled)
        if (cardDetailsAlreadyFilled == true) {
            cy.get(creditCardPage.getCreditCardCVVIframeLocatorString()).then($element => {
                const $body = $element.contents().find('body')
                let stripe = cy.wrap($body)
                stripe.find(creditCardPage.getCreditCardCVVLocatorString()).click().type(creditCard.creditCardCVV)
                stripe = cy.wrap($body)
            })
        } else {
            //Select credit card iframe and fill the details if not already present
            cy.wait(Cypress.config('twoSecondWait'))
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
        }
    })
})

