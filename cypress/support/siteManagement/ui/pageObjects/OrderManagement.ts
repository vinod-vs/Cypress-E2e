export class OrderManagement {
  getCustomerSearchMenu() {
    return cy.get('a:contains("Customer Search")');
  }

  getOrderIDTextField() {
    return cy.get('#OrderID');
  }

  getCustomerSearchButton() {
    return cy.get('input[value="Customer Search"]');
  }

  getSearchButton() {
    return cy.get('input[value="Search"]');
  }

  getUserLockingMenu() {
    return cy.get('a:contains("User Locking")');
  }

  //Search order page common elements
  getOrderReference() {
    return cy.get('label[for="OrderReference"]');
  }

  getOrderTotal() {
    return cy.get('div label[for="OrderTotal"]');
  }

  getEdrNumber() {
    return cy.get('div label[for="EdrNumber"]');
  }

  //WOW TAB Elements
  getWOWTab() {
    return cy.get('li[class*="tab-woolworths"]');
  }  
  getWOWTabOrderId() {
    return cy.get('div#tab-woolworths-form div label[for="OrderID"]');
  }
  getWOWTabOrderStatus() {
    return cy.get('div#tab-woolworths-form div label[for="OrderStatus"]');
  }
  getWOWTabOrderDeliveryFee() {
    return cy.get('div#tab-woolworths-form div label[for="OrderDeliveryFee"]');
  }
  getWOWTabSubtotal() {
    return cy.get('div#tab-woolworths-form div label[for="WowSubtotal"]');
  }
//WOW TAB ordered items elements
  getWOWTabItemsTable() {
    return cy.get('div#tab-woolworths-form div.refund-lines-table');
  }
  

  //EDM TAB Elements
  getEDMTab() {
    return cy.get('li[class*="tab-market"]');
  }
  getEDMTabSellerDetailsCommonDivString() {
    return '.seller-info';
  }
  getEDMTabOrderDeliveryFee() {
    return cy.get('div#tab-market-form div label[for="DeliveryFee"]');
  }
  getEDMTabOrderItemsMainDiv() {
    return cy.get('form#market-refund-lines-form > div:first-child');
  }
  //Common Individual Sellers details section
  getEDMTabSellerNameString() {
    return 'div[class*="seller-header"]';
  }
  getEDMTabCommonOrderItemsBySellerOrderIdString() {
    return 'label[for="seller_InvoiceId"]';
  }  
  getEDMTabCommonOrderItemsBySellerOrderStatusString() {
    return 'label[for="seller_OrderStatus"]';
  }
  getEDMTabCommonOrderItemsBySellerTrackingLink() {
    return cy.get('.seller-info label[for="seller_Shipments"]');
  }
  getEDMTabCommonOrderItemsBySellerSubtotalString() {
    return 'label[for="seller_Subtotal"]';
  }
  //Individual Sellers section. Items table
  getEDMTabCommonItemsTable() {
    return cy.get('div#tab-market-form div.refund-lines-table');
  }

  //Common items table elements. Same for WOW & MP
  getCommonItemsTableStockcodeString() {
    return 'td.refund-order-stockcode';
  }
  getCommonItemsTableTRString() {
    return 'tr[class*="refund-order-line"]';
  }
  getCommonItemsTablePackageSize() {
    return cy.get('td.refund-order-package-size');
  }
  getCommonItemsTableQuantityString() {
    return 'td[class*="quantity-ordered-column"]';
  }
  getCommonItemsTableReturnQuantityString() {
    return 'td[class="quantity-column"]';
  }
  getCommonItemsTableUnitPriceString() {
    return 'td[class="refund-order-unit-price"]';
  }
  getCommonItemsTablePriceBeforeDiscountString() {
    return 'td[class="numeric"]';
  }
  getCommonItemsTableItemTotalString() {
    return 'td[class="total-column"]';
  }

  getRefundCheckboxForStockcode(stockcode) {
    let checkbocLoc = "input[class*='refund-checkbox'][name*='"+stockcode+"']"
    return cy.get(checkbocLoc);
  }

  getRefundDetailsForStockcode(stockcode) {
    let refundDetailsLoc = "tr[class*='" + stockcode + " return'] td[class*='refund-order-stockcode']"    
    return cy.get(refundDetailsLoc);
  }

  getRefundDetailsTDForStockcode(stockcode) {
    let refundDetailsLoc = "tr[class*='" + stockcode + " return']"    
    return cy.get(refundDetailsLoc);
  }
  
  getRefundReasonFieldForStockcode(stockcode) {
    let refundReasonLoc = "select[class='refund-edit-reason'][name*='"+stockcode+"']"
    return cy.get(refundReasonLoc);
  }

  getRefundCommentFieldForStockcode(stockcode) {
    let refundCommentLoc = "input[class='refund-edit-comment'][name*='"+stockcode+"']"
    return cy.get(refundCommentLoc);
  }

  getRefundQuantityFieldForStockcode(stockcode) {
    let refundQuantityLoc = "input[class='refund-edit-amount'][name*='"+stockcode+"-Payment].Quantity']"
    return cy.get(refundQuantityLoc);
  }

  getRefundSaveButton() {
    return cy.get("input[name='SaveButton']")
  }

  getRefundApproveButton() {
    return cy.get("input[name='ApproveButton']")
  }

  getRefundShippingFeeCheckbox() {
    return cy.get("input[class*='refund-checkbox'][name*='RefundLine[-2-0]']")
  }

  getRefundShippingFeeReasonField() {
    return cy.get("select[class='refund-edit-reason'][name*='RefundLines[-2-0-Payment].ReasonID']")
  }

  getRefundShippingFeeCommentField() {
    return cy.get("input[class='refund-edit-comment'][name*='RefundLines[-2-0-Payment].Comment']")
  }

  getGoodWillField() {
    return cy.get(".goodwill-total")
  }
  

}

export const onOrderManagement = new OrderManagement();
