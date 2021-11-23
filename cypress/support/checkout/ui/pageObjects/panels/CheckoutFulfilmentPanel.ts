import { SharedAddressSelector } from "cypress/support/shared/ui/pageObjects/SharedAddressSelector";

export class CheckoutFulfilmentPanel extends SharedAddressSelector{
    getChangeFulfilmentButton(){
        return cy.get('#checkout-fulfilmentPanel .panel-actions-change-button');
    }

    getSaveDetailsButton(){
        return cy.get('.panel-actions-button .shopper-action');
    }

    getCancelButton(){
        return cy.get('.panel-actions-button .reversed-primary');
    }
}

export const onCheckoutFulfilmentPanel = new CheckoutFulfilmentPanel();