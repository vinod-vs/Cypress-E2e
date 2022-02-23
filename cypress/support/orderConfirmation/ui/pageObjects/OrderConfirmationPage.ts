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

  GoBackToHomePage () {
    this.getBackToHomeLink().click()
  }

  GoToMyOrderDetailsPage () {
    this.getMakeChangesToMyOrderButton().click()
  }

  GoToTrackMyOrderPage () {
    this.getTrackMyOrderButton().click()
  }

  private getOrderPaymentSummaryDetailInfoValue (typeName: string) {
    return cy.contains(typeName).parents('.confirmation-order-information__row').find('.confirmation-order-information__highlight')
  } 
}

export const onOrderConfirmationPage = new OrderConfirmationPage()
