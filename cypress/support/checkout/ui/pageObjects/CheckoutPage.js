class CheckoutPage {
  getPlaceOrderButton() {
    return cy.get('.auto_place-order > .shopper-action')
  }

  getSaveDetailsButton() {
    return cy.get('.panel-actions-button > .shopper-action > .ng-star-inserted')
  }

  getThirdDayDeliverySlot() {
    return cy.get('.dates-container-inner > :nth-child(4)')
  }

  getThirdDayDeliveryTwoToFiveSlot() {
    return cy.get(':nth-child(2) > .time-slot-list > :nth-child(2) > .time-slot')
  }

  getThirdDayDeliveryFourToSevenSlot() {
    return cy.get(':nth-child(2) > .time-slot-list > :nth-child(3) > .time-slot')
  }

  getDeliveryDateLocatorString() {
    return '.dates-container-inner > :nth-child(X)'
  }

  getDeliveryTimeLocatorString() {
    return ':nth-child(A) > .time-slot-list > :nth-child(B) > .time-slot'
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

  getGroceriesEstimatedTimeOfDeliveryLocatorString() {
    return '.auto_fulfilment-date-time'
  }

  getGroceriesDeliveryFee() {
    return cy.get(':nth-child(2) > .auto_delivery-fee-summary')
  }

  getGroceriesDeliveryNormalFeeLocatorString() {
    return '.normal-fee'
  }

  getGroceriesDeliverySaleFeeLocatorString() {
    return '.sale-fee'
  }
  getGroceriesDeliveryFeeLocatorString() {
    return ':nth-child(2) > .auto_delivery-fee-summary'
  }

  getEMDeliveryFeeLocatorString() {
    return ':nth-child(3) > .auto_delivery-fee-summary'
  }

  getWoolworthsItemsSubtotalLocatorString() {
    return '#checkout-woolworths-items-subtotal > .payment-amount'
  }

  getWoolworthsItemsSubtotal() {
    return cy.get('#checkout-woolworths-items-subtotal > .payment-amount')
  }

  getWoolworthsItemsShippingFeeLocatorString() {
    return ':nth-child(3) > .payment-amount'
  }

  getWoolworthsItemsShippingFee() {
    return cy.get(':nth-child(3) > .payment-amount')
  }

  getReusableBagsFeeLocatorString() {
    return ':nth-child(2) > .payment-amount'
  }

  getReusableBagsFee() {
    return cy.get(':nth-child(2) > .payment-amount')
  }
  
  getMarketItemsSubtotalLocatorString() {
    return '#checkout-market-items-subtotal > .payment-amount'
  }

  getMarketItemsSubtotal() {
    return cy.get('#checkout-market-items-subtotal > .payment-amount')
  }

  getMarketItemsShippingFeeLocatorString() {
    return '#checkout-market-items-delivery-fee > .payment-amount'
  }

  getMarketItemsShippingFee() {
    return cy.get('#checkout-market-items-delivery-fee > .payment-amount')
  }

  getTotalOrderAmountLocatorString() {
    return ':nth-child(8) > .payment-amount'
  }

  getTotalOrderAmount() {
    return cy.get(':nth-child(8) > .payment-amount')
  }
}

export default CheckoutPage
