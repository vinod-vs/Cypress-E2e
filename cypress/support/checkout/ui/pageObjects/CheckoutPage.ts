import { CheckoutFulfilmentSelectionPanel } from './panels/CheckoutFulfilmentSelectionPanel'
import { CheckoutFulfilmentWindowPanel } from './panels/CheckoutFulfilmentWindowPanel'
import { CheckoutReviewItemsPanel } from './panels/CheckoutReviewItemsPanel'
import { CheckoutPaymentPanel } from './panels/CheckoutPaymentPanel'

export class CheckoutPage {
  onCheckoutFulfilmentSelectionPanel = new CheckoutFulfilmentSelectionPanel();
  onCheckoutFulfilmentWindowPanel = new CheckoutFulfilmentWindowPanel();
  onCheckoutReviewItemsPanel = new CheckoutReviewItemsPanel();
  onCheckoutPaymentPanel = new CheckoutPaymentPanel();

  getContinueShoppingLink() {
    return cy.get('.continue-shopping-link')
  }

}

export const onCheckoutPage = new CheckoutPage()
