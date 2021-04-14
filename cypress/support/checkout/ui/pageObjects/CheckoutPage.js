class CheckoutPage {

    getPlaceOrderButton() {
        return cy.get('.auto_place-order > .shopper-action')
    }

    getSaveDetailsButton() {
        return cy.get('.panel-actions-button > .shopper-action > .ng-star-inserted')
    }

    getThirdDayDeliverySlot() {
        return cy.get(".dates-container-inner > :nth-child(4)")
    }

    getThirdDayDeliveryTwoToFiveSlot() {
        return cy.get(':nth-child(2) > .time-slot-list > :nth-child(2) > .time-slot')
    }

    getDeliveryOrPickupSavedConfirmationElement() {
        return cy.get('#checkout-fulfilmentPanel > .panel > .ng-trigger > .panel-actions > .panel-actions-change-button')
    }

    getDeliveryTimeSlotSavedConfirmationElement() {
        return cy.get('.auto_checkout-accordion-panel__time.ng-tns-c233-2 > .panel > .ng-trigger > .panel-actions > .panel-actions-change-button')
    }

    getGroceriesEstimatedTimeOfDelivery() {
        return cy.get('.auto_fulfilment-date-time')
    }    

    getItemsSavedConfirmationElement() {
        return cy.get('#checkout-reviewPanel > .panel > .ng-trigger > .panel-actions > .panel-actions-change-button')
    }

    getPaymentInstructionsFrame() {
        return cy.get('.payment-instruments')
    }    
}

export default CheckoutPage;