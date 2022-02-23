import { CheckoutAccordionPanel } from "./CheckoutAccordionPanel";
import { Notification } from "../../../../shared/ui/components/Notification";

export class CheckoutMarketplaceFulfilmentWindowPanel extends CheckoutAccordionPanel {
  private marketplaceFulfilmentWindowPanel = '.auto_checkout-accordion-panel__market';

  constructor() {
    super('.auto_checkout-accordion-panel__market');
  }

  isAccordionActiveAndEditable(): void {
    throw new Error("Method not implemented.");
  }

  isAccordionSavedAndSummarised(): void {
    throw new Error("Method not implemented.");
  }

  isAccordionCollapsedAndClosed(): void {
    throw new Error("Method not implemented.");
  }

  restrictedNotification(): Notification {
    return new Notification(cy.get(this.marketplaceFulfilmentWindowPanel));
  }
}

export const onCheckoutMarketplaceFulfilmentWindowPanel = new CheckoutMarketplaceFulfilmentWindowPanel();