/// <reference types="cypress" />

import shoppers from "../../../fixtures/myAccount/b2bShoppers.json";
import creditCard from "../../../fixtures/myAccount/creditCard.json";
import TestFilter from "../../../support/TestFilter";
import "../../../support/login/ui/commands/login";
import "../../../support/myAccount/ui/commands/myAccount";
import "../../../support/myAccount/ui/commands/myPaymentMethods";
import "../../../support/logout/ui/commands/logout";

TestFilter(["B2B", "UI", "P0"], () => {
  describe("[UI] My payment methods page for eligible B2B shoppers", () => {
    beforeEach(() => {
      cy.clearCookies({ domain: null });
      cy.clearLocalStorage({ domain: null });
      Cypress.Cookies.preserveOnce("w-rctx");
    });

    it("My Payment methods page for B2B shopper - add and delete credit cards", () => {
      // Login
      cy.loginViaUi(shoppers[0]);
      //Navigate to My account
      cy.navigateToMyAccountViaUi();
      //Navigate to 'My Payments Methods' page
      cy.navigateToMyPaymentMethodsViaUi();
      //Verify details on 'My Payments Methods' page
      cy.verifyMyPaymentMethodsPage();
      //Save new credit card
      cy.saveNewCreditCardViaUi(creditCard);
      //Delete credit card
      cy.deleteCreditCardViaUi(creditCard);
      cy.logoutViaUi();
    });

    it("My Payment methods not display for B2B shopper who is only eligible for Open pay payments", () => {
      // Login as shopper who's not eligible for credit card payments
      cy.loginViaUi(shoppers[1]);
      //Navigate to My account
      cy.navigateToMyAccountViaUi();
      //Verify 'My Payments Methods' not visible
      cy.verifyMyPaymentMethodsNotVisible();
      cy.logoutViaUi();
    });
  });
});
