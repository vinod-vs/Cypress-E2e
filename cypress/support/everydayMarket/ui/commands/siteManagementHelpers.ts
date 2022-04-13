import "../../../siteManagement/ui/commands/login";
import "../../../siteManagement/ui/commands/homepage";
import "../../../siteManagement/ui/commands/orderManagement";
import { OrderManagementMenu } from "cypress/support/siteManagement/ui/commands/OrderManagementMenu";
import { HomepageTopMenu } from "cypress/support/siteManagement/ui/commands/HomepageTopMenu";

Cypress.Commands.add("loginToSMAndSearchOrder", (loginDetails, orderId) => {
  cy.siteManagementLoginViaUi(loginDetails.email, loginDetails.password);
  cy.selectTopMenu(HomepageTopMenu.ORDER_MANAGEMENT);
  cy.selectOrderManagementSubMenu(OrderManagementMenu.CUSTOMER_SEARCH);
  cy.wait(5000);
  cy.searchOrder(orderId);
  cy.wait(10000);
});


Cypress.Commands.add("searchAnOrderOnSM", (orderId) => {
  cy.selectTopMenu(HomepageTopMenu.ORDER_MANAGEMENT);
  cy.selectOrderManagementSubMenu(OrderManagementMenu.CUSTOMER_SEARCH);
  cy.wait(5000);
  cy.searchOrder(orderId);
  cy.wait(10000);
});
