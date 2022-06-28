/// <reference types="cypress" />

import TestFilter from "../../../support/TestFilter";
import data from "../../../fixtures/placeOrder/b2bOrderData.json";
import "../../../support/login/ui/commands/login";
import "../../../support/logout/ui/commands/logout";
import "../../../support/fulfilment/ui/commands/deliveryDateAndWindow";
import "../../../support/search/ui/commands/searchAndAddProduct";
import "../../../support/payment/ui/commands/creditCardPayment";
import "../../../support/sideCart/ui/commands/sideCart";
import { onCheckoutPage } from '../../../support/checkout/ui/pageObjects/CheckoutPage'
import { onOrderConfirmationPage } from '../../../support/orderConfirmation/ui/pageObjects/OrderConfirmationPage'

TestFilter(["B2B", "UI", "P0"], () => {
  describe("[UI] Place a direct to boot order on Woolworths at Work website using Credit Card", () => {
    beforeEach(() => {
      cy.clearCookies({ domain: null });
      cy.clearLocalStorage({ domain: null });
      Cypress.Cookies.preserveOnce("w-rctx");
      
    });

    it("Place a direct to boot order on Woolworths at Work website using Credit Card", () => {
      let shopper =data.b2bOrderData1.shopper1;
      let testdata =data.b2bOrderData1
      // Login
      cy.loginViaUi(shopper);
      // Select Delivery date Window
      cy.selectAvailableDirectToBootDetailsOnFms();
      // Clear trolley
      cy.clearCartViaUi();
      // Search and add the products
      cy.searchItemsAndAddToCartTillGivenLimit(testdata)
      // Go to Checkout
      cy.openSideCart();
      cy.goToCheckout();
      // Fill credit card details
      cy.fillCreditCardPaymentDetails(data.b2bOrderData1.payment.creditCard);
      // // Click place order
      onCheckoutPage.onCheckoutPaymentPanel.selectPlaceOrder()
      // Verify order confirmation page
      onOrderConfirmationPage.VerifyOrderConfirmationHeader()
      // Logout
      cy.logoutViaUi(shopper);
    });
  });
});
