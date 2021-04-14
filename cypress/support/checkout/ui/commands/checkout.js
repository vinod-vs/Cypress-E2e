import CheckoutPage from '../pageObjects/CheckoutPage';

const checkoutPage = new CheckoutPage();

Cypress.Commands.add('selectAnyDeliveryTimeSlot', () => {
    //Select third delivery slot
    checkoutPage.getThirdDayDeliverySlot().click();
    cy.wait(1000);
    checkoutPage.getThirdDayDeliveryTwoToFiveSlot().click();
    cy.wait(1000);
    cy.scrollTo('bottom');
    cy.wait(1000);

    //Click time slot save details
    cy.saveGroceriesDeliveryTimeDetails()
})

Cypress.Commands.add('saveGroceriesDeliveryTimeDetails', () => {
    //Click time slot save details
    cy.scrollTo('bottom');
    cy.wait(1000);
    checkoutPage.getSaveDetailsButton().click({ multiple: true });
    cy.wait(1000);

    //Verify details are saved
    //checkoutPage.getDeliveryTimeSlotSavedConfirmationElement().should('be.visible')
    checkoutPage.getGroceriesEstimatedTimeOfDelivery().should('be.visible')
})

Cypress.Commands.add('saveItemsReviewDetails', () => {
    //Click time slot save details
    cy.scrollTo('bottom');
    cy.wait(1000);
    checkoutPage.getSaveDetailsButton().click({ multiple: true });
    cy.wait(1000);

    //Verify details are saved
    checkoutPage.getItemsSavedConfirmationElement().should('be.visible')
})

Cypress.Commands.add('clickPlaceOrder', () => {
    //Click place order
    checkoutPage.getPlaceOrderButton().click();
    cy.wait(1000)
})