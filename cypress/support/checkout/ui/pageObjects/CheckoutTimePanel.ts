export class CheckoutTimePanel{
    getChangeTimeButton(){
        return cy.get('#checkout-timePanel .panel-actions-change-button');
    }
}

export const onCheckoutTimePanel = new CheckoutTimePanel();