/// <reference types="Cypress" />
import PayPalPage from '../pageObjects/PayPalPage'

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