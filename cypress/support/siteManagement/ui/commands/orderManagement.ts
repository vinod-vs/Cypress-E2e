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
  (stockcode, refundReason, refundComment, refundQuantity, goodwillAmount) => {
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

      if(goodwillAmount>0) {
        onOrderManagement.getGoodWillField().clear()
        onOrderManagement.getGoodWillField().type(goodwillAmount)
      }

    //Click save and approve
    onOrderManagement.getRefundSaveButton().click();
    onOrderManagement.getRefundApproveButton().click();
  }
);

Cypress.Commands.add("refundShippingFee", (refundReason, refundComment, goodwillAmount) => {
  //Fill refund details
  onOrderManagement.getRefundShippingFeeCheckbox().click();
  onOrderManagement.getRefundShippingFeeReasonField().select(refundReason);
  onOrderManagement.getRefundShippingFeeCommentField().type(refundComment);

  if(goodwillAmount>0) {
    onOrderManagement.getGoodWillField().clear()
    onOrderManagement.getGoodWillField().type(goodwillAmount)
  }

  //Click save and approve
  onOrderManagement.getRefundSaveButton().click();
  onOrderManagement.getRefundApproveButton().click();
});
