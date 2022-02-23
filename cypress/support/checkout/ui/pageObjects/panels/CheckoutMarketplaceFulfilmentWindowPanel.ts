import { CheckoutAccordionPanel } from "./CheckoutAccordionPanel";

export class CheckoutMarketplaceFulfilmentWindowPanel extends CheckoutAccordionPanel {
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

  getRestrictedNotification() {
    return cy.get('.notification-container');
  }
}

export const onCheckoutMarketplaceFulfilmentWindowPanel = new CheckoutMarketplaceFulfilmentWindowPanel();