import { onOrderManagement } from "../pageObjects/OrderManagement";
import { OrderManagementMenu } from "./OrderManagementMenu";

Cypress.Commands.add("selectOrderManagementSubMenu", (menuToSelect) => {
  switch (menuToSelect) {
    case OrderManagementMenu.CUSTOMER_SEARCH:
      onOrderManagement.getCustomerSearchMenu().click();
      break;
    case OrderManagementMenu.USER_LOCKING:
      onOrderManagement.getUserLockingMenu().click();
      break;
    default:
      onOrderManagement.getCustomerSearchButton().click();
      break;
  }
});

Cypress.Commands.add("searchOrder", (orderId) => {
  onOrderManagement.getOrderIDTextField().click({ force: true });
  onOrderManagement.getOrderIDTextField().type(orderId);
  onOrderManagement.getSearchButton().click();
});

Cypress.Commands.add(
  "createARefund",
  (stockcode, refundReason, refundComment, refundQuantity) => {
    //Fill refund details
    onOrderManagement.getRefundCheckboxForStockcode(stockcode).click();
    onOrderManagement
      .getRefundReasonFieldForStockcode(stockcode)
      .select(refundReason);
    onOrderManagement
      .getRefundCommentFieldForStockcode(stockcode)
      .type(refundComment);
    onOrderManagement.getRefundQuantityFieldForStockcode(stockcode).clear();
    onOrderManagement
      .getRefundQuantityFieldForStockcode(stockcode)
      .type(refundQuantity);

    //Click save and approve
    onOrderManagement.getRefundSaveButton().click();
    onOrderManagement.getRefundApproveButton().click();
  }
);

Cypress.Commands.add("refundShippingFee", (refundReason, refundComment) => {
  //Fill refund details
  onOrderManagement.getRefundShippingFeeCheckbox().click();
  onOrderManagement.getRefundShippingFeeReasonField().select(refundReason);
  onOrderManagement.getRefundShippingFeeCommentField().type(refundComment);

  //Click save and approve
  onOrderManagement.getRefundSaveButton().click();
  onOrderManagement.getRefundApproveButton().click();
});
