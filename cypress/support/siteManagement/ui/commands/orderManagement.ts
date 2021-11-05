import { onOrderManagement } from "../pageObjects/OrderManagement";
import { OrderManagementMenu } from "./OrderManagementMenu";

Cypress.Commands.add("selectOrderManagementSubMenu", (menuToSelect) => {
  switch (menuToSelect) {
    case OrderManagementMenu.CUSTOMER_SEARCH:
      onOrderManagement.getCustomerSearchMenu().click()
      break;
    case OrderManagementMenu.USER_LOCKING:
      onOrderManagement.getUserLockingMenu().click()
      break;
    default:
      onOrderManagement.getCustomerSearchButton().click()
      break;
  }
});

Cypress.Commands.add("searchOrder", (orderId) => {
  onOrderManagement.getOrderIDTextField().click({force: true})
  onOrderManagement.getOrderIDTextField().type(orderId)
  onOrderManagement.getSearchButton().click()
});
