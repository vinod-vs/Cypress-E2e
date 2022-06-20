import { onSideCartPage } from "../../../sideCart/ui/pageObjects/SideCartPage";
import { onHomePage } from "../../../homePage/ui/pageObjects/HomePage";
import { onCheckoutPage } from "../../../checkout/ui/pageObjects/CheckoutPage";
import { link } from "fs";

Cypress.Commands.add("openSideCart", () => {
  onSideCartPage.getViewCart().click();
  cy.wait(1000);
  onSideCartPage.getCheckoutButton().should("be.visible");
});

Cypress.Commands.add("goToCheckout", () => {
  // Click on Checkout button on the opened side cart
  onSideCartPage.getCheckoutButton().click();
  onCheckoutPage.getSpinner().should("be.visible");
  onCheckoutPage.getSpinner().should("not.exist", { timeout: 5000 });
  cy.url().should("include", "/checkout");
});

Cypress.Commands.add("clearCartViaUi", () => {
  // open cart if it has >0 amount and clear it
  onSideCartPage.getTotalAmountElementOnHeader().then(function (cartElement) {
    cy.log(cartElement.text());
    const cartAmount = cartElement.text();
    if (cartAmount.includes("$0")) {
      cy.log("Cart has no items. Cart Value: " + cartAmount);
    } else {
      cy.log(
        "Cart has some items.  Cart Value: " + cartAmount + ". Removing them."
      );
      onSideCartPage.getViewCart().click();
      // Clear unavailable items if exist
      cy.get("body").then(($body) => {
        if ($body.find(onSideCartPage.getClearUnavailbleItemsLink()).length > 0 ) {
          cy.get(onSideCartPage.getClearUnavailbleItemsLink()).each(
            (link, index) => {
              cy.log("Cart has unavailable items to clear : " + index);
              cy.wrap(link).click();
            }
          );
        }
      });

      //select ClearEntireCart 
      cy.get("body").then(($body) => {
        if ($body.find(onSideCartPage.getClearEntireCart()).length > 0) {
          cy.get(onSideCartPage.getClearEntireCart()).each((link) => {
            cy.log("Cart has items to clear.");
            cy.wrap(link).click();
          });
        }
      });
      onSideCartPage.getClearEntireCartLink().click({force:true});
      cy.wait(1000);
      onSideCartPage.getConfirmClearCartLink().click();
      cy.wait(500);
      // Verify the cart is empty
      onSideCartPage.checkIfSidecartIsEmpty();
      // Click Close cart
      onSideCartPage.getCloseSideCartButton().click();
      cy.wait(500);
      // Verify the cart is closed
      onSideCartPage.getTotalAmountElementOnHeader().should("be.visible");
    }
  });
});
