//
// This class will capture DOM elements on the delivery unlimited payments page
//

import duPaymentDetails from '../../../../fixtures/duSubscription/subscriptionPaymentDetails.json'

export class DeliveryUnlimitedPaymentsPage {
  
    getPageURL () {
      return cy.url();
    }
  
    getPageHeading () {
        return cy.get('.deliverySaverPaymentSetup-header')
    }

    getSubHeading () {
        return cy.get('.deliverySaverPaymentSetup-section-planHeader')
    }

    getSelectedPlanInformation() {
        return cy.get('.deliverySaverPaymentSetup-section-planContainer-payment.u-flex.u-flexRow.u-flexSpaceBetween')
    }

    getCreditCardSelection () {
        return cy.get('.ng-star-inserted > .toggle-button')
    }

    getIFramePaymentSection(){
        return cy.get('.creditCardAdd-iframe')
    }
 
    getBillingAddress() {
        return cy.get('input#billingAddressSelector')
    }

    getBillingAddressFirstEntry() {
        return cy.get('ul#billingAddressSelector-listbox > li:nth-of-type(1)')
    }

    getTermAndConditions() {
        return cy.get('.checkbox-box')
    }

    getSubmitButton() {
        return cy.get('.ng-valid:nth-child(3) button:nth-child(4)')
    }

    // This method will set the payment details during DU subscription process
    // DOM elements are placed inside an iframe
    setDUPaymentDetails () {
        this.getIFramePaymentSection().then(($iframe) => {
            const $body = $iframe.contents().find('body')
            cy.wrap($body).find('input#card_number').type(duPaymentDetails.cardNumber)
            cy.wrap($body).find('input#expiry_month').type(duPaymentDetails.expiryMonth)
            cy.wrap($body).find('input#exp_year').type(duPaymentDetails.expiryYear)
            cy.wrap($body).find('input#cvv_csv').type(duPaymentDetails.CVV)
        })
    }
  }
  
  export const onDeliveryUnlimitedPayment = new DeliveryUnlimitedPaymentsPage()
  