import { CheckoutFulfilmentWindowPanel } from '../components/CheckoutFulfilmentWindowPanel';
import { CheckoutTimeSlotSelector } from '../components/CheckoutTimeSlotSelector'

export class CheckoutWindowTimePanel{
    onCheckoutTimeSlotSelector = new CheckoutTimeSlotSelector();
    onCheckoutFulfilmentWindowPanel = new CheckoutFulfilmentWindowPanel();
}

export const onCheckoutWindowTimePanel = new CheckoutWindowTimePanel()