import { SharedAddressSelector } from 'cypress/support/shared/ui/pageObjects/SharedAddressSelector'

export class CheckoutFulfilmentSelectionPanel extends SharedAddressSelector {
  getEditFulfilmentButton () {
    return cy.get('#checkout-fulfilmentPanel .panel-actions-change-button')
  }

  getSaveDetailsButton () {
    return cy.get('.panel-actions-button .shopper-action')
  }

  getCancelButton () {
    return cy.get('.panel-actions-button .reversed-primary')
  }

  getSummarisedFulfilmentAddressElement () {
    return cy.get('wow-checkout-fulfilment-summary span')
  }
}

export const onCheckoutFulfilmentSelectionPanel = new CheckoutFulfilmentSelectionPanel()
