import { CheckoutFulfilmentPanel } from './panels/CheckoutFulfilmentPanel'
import { CheckoutWindowTimePanel } from './panels/CheckoutWindowTimePanel'
import { CheckoutReviewItemsPanel } from './panels/CheckoutReviewItemsPanel'
import { CheckoutPaymentPanel } from './panels/CheckoutPaymentPanel'


export class CheckoutPage {
  onCheckoutFulfilmentPanel = new CheckoutFulfilmentPanel();
  onCheckoutWindowTimePanel = new CheckoutWindowTimePanel();
  onCheckoutReviewItemsPanel = new CheckoutReviewItemsPanel();
  onCheckoutPaymentPanel = new CheckoutPaymentPanel();
}

export const onCheckoutPage = new CheckoutPage()
