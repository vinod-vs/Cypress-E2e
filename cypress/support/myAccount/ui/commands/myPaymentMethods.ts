/// <reference types="cypress"/>

import { onMyAccountPage } from "../pageObjects/MyAccountPage";
import { onMyPaymentMethodsPage } from "../pageObjects/MyPaymentMethodsPage";

Cypress.Commands.add("navigateToMyPaymentMethodsViaUi", () => {
  onMyAccountPage
    .getLeftNavigationMenu()
    .contains("My Payment Methods")
    .click();
});

Cypress.Commands.add("verifyMyPaymentMethodsNotVisible", () => {
  onMyAccountPage
    .getLeftNavigationMenu()
    .should("not.contain", "My Payment Methods");
});

Cypress.Commands.add("verifyMyPaymentMethodsPage", () => {
  onMyPaymentMethodsPage.getPageHeading().contains("My Payment Methods");
  onMyPaymentMethodsPage.getPageSubHeading().contains("Add New Payment Method");
  onMyPaymentMethodsPage.getButtonNewCard().contains("New Credit Card");
  onMyPaymentMethodsPage.getDigitalPayitems().should("be.visible");
});

Cypress.Commands.add("saveNewCreditCardViaUi", (creditCard) => {
  onMyPaymentMethodsPage.getButtonNewCard().contains("New Credit Card").click();
  onMyPaymentMethodsPage.getSpinner().should("be.visible");
  onMyPaymentMethodsPage.getSpinner().should("not.exist", {timeout: 5000});
  cy.wait(1000);
  //Add new card details
  addNewCreditCardDetails(creditCard)

  cy.intercept({
    method: "POST",
    url: "creditcard",
  }).as("saveCreditcard");

  onMyPaymentMethodsPage.getButtonSave().click();

  cy.wait("@saveCreditcard").then((interception) => {
    //Verify saved card
    onMyPaymentMethodsPage.getSavedCardNumbers().contains(creditCard.checkCardNumber).should("be.visible");
  });
});


function addNewCreditCardDetails (creditCard: any) {
//Add new credit card details 
cy.get(onMyPaymentMethodsPage.getCreditCardIframeLocatorString()).then(
  ($element) => {
    const $body = $element.contents().find("body");
    let stripe = cy.wrap($body);
    stripe
      .find(onMyPaymentMethodsPage.getCreditCardNumberLocatorString())
      .click()
      .type(creditCard.creditCardNumber);
    stripe = cy.wrap($body);
    stripe
      .find(onMyPaymentMethodsPage.getCreditCardExpMonthLocatorString())
      .click()
      .type(creditCard.creditCardExpMonth);
    stripe = cy.wrap($body);
    stripe
      .find(onMyPaymentMethodsPage.getCreditCardExpYearLocatorString())
      .click()
      .type(creditCard.creditCardExpYear);
    stripe = cy.wrap($body);
    stripe
      .find(onMyPaymentMethodsPage.getCreditCardCVVLocatorString())
      .click()
      .type(creditCard.creditCardCVV);
    stripe = cy.wrap($body);
    stripe
      .find(onMyPaymentMethodsPage.getCreditCardNumberLocatorString())
      .click();
  })
}


Cypress.Commands.add("deleteCreditCardViaUi", (creditCard) => {
  onMyPaymentMethodsPage.getButtonRemoveCreditCard().each(($el) => {
    const textVeg = $el.text();
    if (textVeg.includes(creditCard.checkCardNumber)) {
      //Click remove
      cy.wrap($el).click();
      //Select Delete confirmation
      onMyPaymentMethodsPage.getButtonRemoveCreditCardConfirm().click();
    }
  });
  cy.wait(1000);
  //Due to an error in UAT, below section may appear and need to select Retry to refresh the details
  cy.get("#center-panel").then(($el) => {
    if ($el.find(onMyPaymentMethodsPage.getButtonRetryLocatorString()).length > 0) {
      cy.get(onMyPaymentMethodsPage.getButtonRetryLocatorString()).click();
    }
  });
  onMyPaymentMethodsPage.getSavedCardNumbers().contains(creditCard.checkCardNumber).should("not.exist");
});
