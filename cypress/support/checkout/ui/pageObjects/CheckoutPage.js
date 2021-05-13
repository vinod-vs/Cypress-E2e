class CheckoutPage {
  getPlaceOrderButton () {
    return cy.get('.auto_place-order > .shopper-action')
  }

  getSaveDetailsButton () {
    return cy.get('.panel-actions-button > .shopper-action > .ng-star-inserted')
  }

  getThirdDayDeliverySlot () {
    return cy.get('.dates-container-inner > :nth-child(4)')
  }

  getThirdDayDeliveryTwoToFiveSlot () {
    return cy.get(':nth-child(2) > .time-slot-list > :nth-child(2) > .time-slot')
  }

  getThirdDayDeliveryFourToSevenSlot () {
    return cy.get(':nth-child(2) > .time-slot-list > :nth-child(3) > .time-slot')
  }

  getDeliveryDateLocatorString () {
    return '.dates-container-inner > :nth-child(X)'
  }

  getDeliveryOrPickupSavedConfirmationElement () {
    return cy.get('#checkout-fulfilmentPanel > .panel > .ng-trigger > .panel-actions > .panel-actions-change-button')
  }

  getDeliveryTimeSlotSavedConfirmationElement () {
    return cy.get('.auto_checkout-accordion-panel__time.ng-tns-c233-2 > .panel > .ng-trigger > .panel-actions > .panel-actions-change-button')
  }

  getGroceriesEstimatedTimeOfDelivery () {
    return cy.get('.auto_fulfilment-date-time')
  }

  getItemsSavedConfirmationElement () {
    return cy.get('#checkout-reviewPanel > .panel > .ng-trigger > .panel-actions > .panel-actions-change-button')
  }

  getPaymentInstructionsFrame () {
    return cy.get('.payment-instruments')
  }

  getGroceriesEstimatedTimeOfDeliveryLocatorString () {
    return '.auto_fulfilment-date-time'
  }

  getGroceriesDeliveryFee () {
    return cy.get('span:contains("Service Fee") +')
  }

  getGroceriesDeliveryNormalFeeLocatorString () {
    return '.normal-fee'
  }

  getGroceriesDeliverySaleFeeLocatorString () {
    return '.sale-fee'
  }

  getGroceriesDeliveryFeeLocatorString () {
    return 'span:contains("Service Fee") +'
  }

  getEMDeliveryFeeLocatorString () {
    return 'span:contains("Delivery Fee") +'
  }

  getWoolworthsItemsSubtotalLocatorString () {
    return '#checkout-woolworths-items-subtotal > .payment-amount'
  }

  getWoolworthsItemsSubtotal () {
    return cy.get('#checkout-woolworths-items-subtotal > .payment-amount')
  }

  getWoolworthsItemsShippingFeeLocatorString () {
    return 'span:contains("Service Fee") +'
  }

  getWoolworthsItemsShippingFee () {
    return cy.get('span:contains("Service Fee") +')
  }

  getOrderDiscountLocatorString () {
    return 'span:contains("Order Discount") +'
  }

  getOrderDiscount () {
    return cy.get('span:contains("Order Discount") +')
  }

  getReusableBagsFeeLocatorString () {
    return 'span:contains("Reusable bags") +'
  }

  getReusableBagsFee () {
    return cy.get('span:contains("Reusable bags") +')
  }

  getMarketItemsSubtotalLocatorString () {
    return '#checkout-market-items-subtotal > .payment-amount'
  }

  getMarketItemsSubtotal () {
    return cy.get('#checkout-market-items-subtotal > .payment-amount')
  }

  getMarketItemsShippingFeeLocatorString () {
    return '#checkout-market-items-delivery-fee > .payment-amount'
  }

  getMarketItemsShippingFee () {
    return cy.get('#checkout-market-items-delivery-fee > .payment-amount')
  }

  getTotalOrderAmountLocatorString () {
    return 'span:contains("Total") +'
  }

  getTotalOrderAmount () {
    return cy.get('span:contains("Total") +')
  }

  getDeliveryDayLocatorString () {
    return '.day.ng-star-inserted[aria-disabled=\'false\']'
  }

  getDeliveryInfoLocatorString () {
    return '.day-info'
  }

  getDeliveryTimeLocatorString () {
    return '.time-slot.false.ng-star-inserted[aria-disabled=\'false\']'
  }

  getDeliveryTimeSpanLocatorString () {
    return '.time-span'
  }
}

export default CheckoutPage
