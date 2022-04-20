import { Notification } from "../../../shared/ui/components/Notification";

export class OrderConfirmationPage {
  private marketplaceRestrictionNotification = 'shared-order-market-restriction-notification'

  getBackToHomeLink () {
    return cy.contains('Back to home')
  }
  
  getOrderConfirmationHeader () {
    return cy.get('.confirmation-container__header')
  }

  getMakeChangesToMyOrderButton () {
    return cy.contains('Make changes to my order')
  }

  getTrackMyOrderButton () {
    return cy.contains('Track my order')
  }

  getConfirmationFulfilmentDetailsContentElement () {
    return cy.get('.confirmation-fulfilment-details__content')
  }

  getOrderNumberElement () {
    return cy.get('.confirmation-fulfilment-details__section-inline-text')
  }

  getOrderNotesElement () {
    return cy.get('.confirmation-fulfilment-details__section-notes')
  }

  restrictedNotification(): Notification {
    return new Notification(cy.get(this.marketplaceRestrictionNotification));
  }

  getOrderRestrictedNotification () {
    return cy.get('.notification-container p')
  }

  getOrderPaymentSummaryOrderCreatedDateElement () {
    return this.getOrderPaymentSummaryDetailInfoValue('Order created')
  }

  getOrderPaymentSummarySubtotalAmountElement () {
    return this.getOrderPaymentSummaryDetailInfoValue('Subtotal')
  }

  getOrderPaymentSummaryBagsAmountElement () {
    return this.getOrderPaymentSummaryDetailInfoValue('bags')
  }

  getOrderPaymentSummaryServiceFeeAmountElement () {
    return this.getOrderPaymentSummaryDetailInfoValue('Service fee')
  }

  getOrderPaymentSummaryTotalAmountElement () {
    return this.getOrderPaymentSummaryDetailInfoValue('Total')
  }

  getOrderSplitPaymentPaidWithGiftCardAmount () {
    return this.getOrderSplitPaymentInstrumentPaidAmount('Paid with Gift Card')
  }

  getOrderSplitPaymentPaidWithCreditCardAmount () {
    return this.getOrderSplitPaymentInstrumentPaidAmount('Paid with Credit Card')
  }

  getOrderSplitPaymentPaidWithPayPalAmount () {
    return this.getOrderSplitPaymentInstrumentPaidAmount('Paid with PayPal')
  }

  goBackToHomePage () {
    this.getBackToHomeLink().click()
  }

  goToMyOrderDetailsPage () {
    this.getMakeChangesToMyOrderButton().click()
  }

  goToTrackMyOrderPage () {
    this.getTrackMyOrderButton().click()
  }

  private getOrderPaymentSummaryDetailInfoValue (typeName: string) {
    return cy.contains(typeName).parents('.confirmation-order-information__row').find('.confirmation-order-information__highlight')
  } 

  private getOrderSplitPaymentInstrumentPaidAmount (typeName: string) {
    return cy.contains(typeName).parents('.confirmation-order-information__label__row').find('.confirmation-order-information__highlight').eq(1)
  } 
}

export const onOrderConfirmationPage = new OrderConfirmationPage()
