import { CheckoutFulfilmentSelectionPanel } from './panels/CheckoutFulfilmentSelectionPanel'
import { CheckoutFulfilmentWindowPanel } from './panels/CheckoutFulfilmentWindowPanel'
import { CheckoutReviewItemsPanel } from './panels/CheckoutReviewItemsPanel'
import { CheckoutPaymentPanel } from './panels/CheckoutPaymentPanel'
import { CheckoutMarketplaceFulfilmentWindowPanel } from './panels/CheckoutMarketplaceFulfilmentWindowPanel'

export class CheckoutPage {
  onCheckoutFulfilmentSelectionPanel = new CheckoutFulfilmentSelectionPanel()
  onCheckoutFulfilmentWindowPanel = new CheckoutFulfilmentWindowPanel()
  onCheckoutReviewItemsPanel = new CheckoutReviewItemsPanel()
  onCheckoutPaymentPanel = new CheckoutPaymentPanel()
  onCheckoutMarketplaceFulfilmentWindowPanel = new CheckoutMarketplaceFulfilmentWindowPanel()

  getContinueShoppingLink() {
    return cy.get('.continue-shopping-link.ng-star-inserted')
  }

  getTradingAccountInfoB2B() {
    return cy.get(
      "wow-checkout-fulfilment-summary.ng-star-inserted > span.ng-star-inserted"
    )
  }

  getFulfillmentTypeInfo() {
    return cy.get(
      "wow-checkout-fulfilment-summary.ng-star-inserted > p.ng-star-inserted"
    )
  }

  getCheckoutDelTimePanel() {
    return cy.get(
      "#checkout-timePanel > .panel > .ng-trigger > .panel-heading"
    )
  }

  getCheckoutEstDelTimePanel() {
    return cy.get(
      ".wow-row > :nth-child(3) > :nth-child(1) > p.ng-star-inserted"
    )
  }

  getWowTimeSlot() {
    return cy.get("wow-time-slot-time button")
  }

  getCheckoutCartAvailableHeading() {
    return cy.get(".checkout-cart-available-item-group-heading")
  }

  getCheckoutDelFeeSummary() {
    return cy.get(".auto_delivery-fee-summary")
  }

  getCheckoutCartLine1Price() {
    return cy.get(
      ":nth-child(2) > .cart-item > :nth-child(1) > .wow-col-8 > .wow-col-md-3 > shared-price.ng-star-inserted > .price"
    )
  }

  getCheckoutCartLine2Price() {
    return cy.get(
      ":nth-child(3) > .cart-item > :nth-child(1) > .wow-col-8 > .wow-col-md-3 > shared-price.ng-star-inserted > .price"
    )
  }

  getContinueBtn() {
    return cy.get(
      "#checkout-reviewPanel > .panel > .ng-trigger > .panel-actions .shopper-action"
    )
  }

  getOrderTotalContainer() {
    return cy.get(".order-total > .order-total-container .totals > .total-amount")
  }

  getCheckoutItemSubtotal() {
    return cy.get('#checkout-items-subtotal > .payment-amount')
  }

  getCheckoutDelFeeTotal() {
    return cy.get(':nth-child(2) > .payment-amount')
  }

  getOrderTotalContainerTitle() {
    return cy.get(".order-total > .order-total-container > .title")
  }

  getOrderTotalLabel() {
    return cy.get(".order-total > .order-total-container > .column")
  }

  getCurrency() {
    return cy.get(".order-total > .order-total-container .dollar-symbol")
  }

  getCheckoutSubTotalPaymentTitle() {
    return cy.get("#checkout-items-subtotal > .payment-title")
  }

  getPurchaseOrderField() {
    return cy.get("#purchaseOrderInput")
  }

}



export const onCheckoutPage = new CheckoutPage()
