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

  getContinueShoppingLink () {
       return cy.get('.continue-shopping-link.ng-star-inserted') 
  }

  getTradingAccountInfoB2B() {
    return cy.get(
      "wow-checkout-fulfilment-summary.ng-star-inserted > span.ng-star-inserted"
    )
  }
}



export const onCheckoutPage = new CheckoutPage()
