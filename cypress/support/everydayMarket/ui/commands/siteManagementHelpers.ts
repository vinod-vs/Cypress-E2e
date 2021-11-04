import "../../../siteManagement/ui/commands/login";
import "../../../siteManagement/ui/commands/homepage";
import "../../../siteManagement/ui/commands/orderManagement";
import { OrderManagementMenu } from "cypress/support/siteManagement/ui/commands/OrderManagementMenu";
import { HomepageTopMenu } from "cypress/support/siteManagement/ui/commands/HomepageTopMenu";

Cypress.Commands.add("loginToSMAndSearchOrder", (loginDetails, orderId) => {
  cy.loginViaUI(loginDetails.email, loginDetails.password);
  cy.selectTopMenu(HomepageTopMenu.ORDER_MANAGEMENT);
  cy.selectOrderManagementSubMenu(OrderManagementMenu.CUSTOMER_SEARCH);
  cy.wait(Cypress.config("fiveSecondWait"));
  cy.searchOrder(orderId);
});
