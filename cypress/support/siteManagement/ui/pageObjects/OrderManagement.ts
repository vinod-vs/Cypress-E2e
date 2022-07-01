export class OrderManagement {
  getCustomerSearchMenu() {
    return cy.get('a:contains("Customer Search")')
  }

  getOrderIDTextField() {
    return cy.get('#OrderID')
  }

  getEmailAddressTextField() {
    return cy.get('#Email')
  }

  getCustomerSearchButton() {
    return cy.get('input[value="Customer Search"]')
  }

  getSearchButton() {
    return cy.get('input[value="Search"]')
  }

  getUserLockingMenu() {
    return cy.get('a:contains("User Locking")')
  }

  // Search order page common elements
  getOrderReference() {
    return cy.get('label[for="OrderReference"]')
  }

  getOrderTotal() {
    return cy.get('div label[for="OrderTotal"]')
  }

  getEdrNumber() {
    return cy.get('div label[for="EdrNumber"]')
  }

  // WOW TAB Elements
  getWOWTab() {
    return cy.get('li[class*="tab-woolworths"]')
  }

  getWOWTabOrderId() {
    return cy.get('div#tab-woolworths-form div label[for="OrderID"]')
  }

  getWOWTabOrderStatus() {
    return cy.get('div#tab-woolworths-form div label[for="OrderStatus"]')
  }

  getWOWTabOrderDeliveryFee() {
    return cy.get('div#tab-woolworths-form div label[for="OrderDeliveryFee"]')
  }

  getWOWTabSubtotal() {
    return cy.get('div#tab-woolworths-form div label[for="WowSubtotal"]')
  }

  // WOW TAB ordered items elements
  getWOWTabItemsTable() {
    return cy.get('div#tab-woolworths-form div.refund-lines-table')
  }

  // EDM TAB Elements
  getEDMTab() {
    return cy.get('li[class*="tab-market"]')
  }

  getEDMTabSellerDetailsCommonDivString() {
    return '.seller-info'
  }

  getEDMTabOrderDeliveryFee() {
    return cy.get('div#tab-market-form div label[for="DeliveryFee"]')
  }

  getEDMTabOrderItemsMainDiv() {
    return cy.get('form#market-refund-lines-form > div:first-child')
  }

  // Common Individual Sellers details section
  getEDMTabSellerNameString() {
    return 'div[class*="seller-header"]'
  }

  getEDMTabCommonOrderItemsBySellerOrderIdString() {
    return 'label[for="seller_InvoiceId"]'
  }

  getEDMTabCommonOrderItemsBySellerOrderStatusString() {
    return 'label[for="seller_OrderStatus"]'
  }

  getEDMTabCommonOrderItemsBySellerTrackingLink() {
    return cy.get('.seller-info label[for="seller_Shipments"]')
  }

  getEDMTabCommonOrderItemsBySellerSubtotalString() {
    return 'label[for="seller_Subtotal"]'
  }

  // Individual Sellers section. Items table
  getEDMTabCommonItemsTable() {
    return cy.get('div#tab-market-form div.refund-lines-table')
  }

  // Common items table elements. Same for WOW & MP
  getCommonItemsTableStockcodeString() {
    return 'td.refund-order-stockcode'
  }

  getCommonItemsTableTRString() {
    return 'tr[class*="refund-order-line"]'
  }

  getCommonItemsTablePackageSize() {
    return cy.get('td.refund-order-package-size')
  }

  getCommonItemsTableQuantityString() {
    return 'td[class*="quantity-ordered-column"]'
  }

  getCommonItemsTableReturnQuantityString() {
    return 'td[class="quantity-column"]'
  }

  getCommonItemsTableUnitPriceString() {
    return 'td[class="refund-order-unit-price"]'
  }

  getCommonItemsTablePriceBeforeDiscountString() {
    return 'td[class="numeric"]'
  }

  getCommonItemsTableItemTotalString() {
    return 'td[class="total-column"]'
  }

  getRefundCheckboxForStockcode(stockcode: any) {
    const checkbocLoc =
      'input[class*=\'refund-checkbox\'][name*=\'' + stockcode + '\']'
    return cy.get(checkbocLoc)
  }

  getRefundDetailsForStockcode(stockcode: any) {
    const refundDetailsLoc =
      'tr[class*=\'' +
      stockcode +
      ' return\'] td[class*=\'refund-order-stockcode\']'
    return cy.get(refundDetailsLoc)
  }

  getRefundDetailsTDForStockcode(stockcode: any) {
    const refundDetailsLoc = 'tr[class*=\'' + stockcode + ' return\']'
    return cy.get(refundDetailsLoc)
  }

  getRefundReasonFieldForStockcode(stockcode: any) {
    const refundReasonLoc =
      'select[class=\'refund-edit-reason\'][name*=\'' + stockcode + '\']'
    return cy.get(refundReasonLoc)
  }

  getRefundCommentFieldForStockcode(stockcode: any) {
    const refundCommentLoc =
      'input[class=\'refund-edit-comment\'][name*=\'' + stockcode + '\']'
    return cy.get(refundCommentLoc)
  }

  getRefundQuantityFieldForStockcode(stockcode: any) {
    const refundQuantityLoc =
      'input[class=\'refund-edit-amount\'][name*=\'' +
      stockcode +
      '-Payment].Quantity\']'
    return cy.get(refundQuantityLoc)
  }

  getRefundSaveButton() {
    return cy.get('input[name=\'SaveButton\']')
  }

  getRefundApproveButton() {
    return cy.get('input[name=\'ApproveButton\']')
  }

  getRefundShippingFeeCheckbox() {
    return cy.get('input[class*=\'refund-checkbox\'][name*=\'RefundLine[-2-0]\']')
  }

  getRefundShippingFeeReasonField() {
    return cy.get(
      'select[class=\'refund-edit-reason\'][name*=\'RefundLines[-2-0-Payment].ReasonID\']'
    )
  }

  getRefundShippingFeeCommentField() {
    return cy.get(
      'input[class=\'refund-edit-comment\'][name*=\'RefundLines[-2-0-Payment].Comment\']'
    )
  }

  getGoodwillTotalField() {
    return cy.get('.goodwill-total')
  }

  getRefundTotalField() {
    return cy.get('.refund-total')
  }

  // ------------- WOW Tab Specific Locators ---------------------
  getWowLineItemsTable() {
    return cy.get(
      '#refund-lines-form > div.refund-lines-table > div > table > tbody'
    )
  }

  getWowLineItemsStockCodeString() {
    return 'td:nth-child(5)'
  }

  getWowLineItemsStockReIssueCheckBoxString() {
    return ' > tr > td:nth-child(5)'
  }

  getWowLineItemsReIssueReasonSelectString() {
    return ' > tr.refund-order-line-reissue.line-1.sc-465135.edit.parent-stockcode- > td:nth-child(2) > select'
  }

  getWowLineItemsShoppersNoteTextBoxString() {
    return ' > tr.refund-order-line-reissue.line-1.sc-465135.edit.parent-stockcode- > td:nth-child(9) > input'
  }

  getWowLineItemsCommentTextBoxString() {
    return ' > tr.refund-order-line-reissue.line-1.sc-465135.edit.parent-stockcode- > td:nth-child(2) > input.refund-edit-comment'
  }

  getWowSaveButton() {
    return cy.get('input[type=submit]:nth-child(6)')
  }

  getCourierRadioButton() {
    return cy.get('label[for="Courier"]')
  }

  getCourierDeliveryAddressDropDown() {
    return cy.get('select[class="AddressID"]')
  }

  getChangeDeliveryWindowDropDown() {
    return cy.get('select#courierDeliveryWindow')
  }

  getDeliveryInstructionsTextBox() {
    return cy.get('textarea#DeliveryInstructions')
  }

  getWowApproveButton() {
    return cy.get('input[name="ApproveButton"]')
  }

  getWowApproveFormSubmit() {
    return cy.get('form[class="refund-approve-form"]')
  }

  getSubmitAndPlaceOrderButton() {
    return cy.get('input[type="submit"]')
  }

  getOrderidOnApprovedRefundDetailsScreeen() {
    return cy.get('label[for="OrderNumber"]')
  }

  getReissueOrderTotalOnApprovedRefundDetailsScreeen() {
    return cy.get(
      '#content-panel > div > div.tab-layout > div:nth-child(18) > label'
    )
  }

  getReissueOrderId() {
    // Added on 28th May
    return cy.get(
      '#content-panel > div > div.tab-layout > div:nth-child(17) > label'
    )
  }

  getOrderManagementTab() {
    return cy.get(
      '#manage-menu-top a[href*="/CustomerMaintenance/CustomerMaintenanceSearch"]'
    )
  }

  getGoodwillCheckboxForStockCode(stockcode: any) {
    return cy.get(
      'input[class*=\'goodwill-checkbox\'][name*=\'' + stockcode + '\']'
    )
  }

  getGoodwillReasonForStockCode(stockcode: any) {
    return cy.get(
      'select[class=\'refund-edit-reason\'][name*=\'' + stockcode + '-Goodwill\']'
    )
  }

  getGoodwillCommentForStockCode(stockcode: any) {
    return cy.get(
      'input[class=\'refund-edit-comment\'][name*=\'' + stockcode + '-Goodwill\']'
    )
  }

  getGoodwillQuantityFieldForStockcode(stockcode: any) {
    return cy.get(
      'input[class=\'refund-edit-amount\'][name*=\'' +
        stockcode +
        '-Goodwill\']:nth-child(2)'
    )
  }

  getGoodwillAmountFieldForStockcode(stockcode: any) {
    return cy.get(
      'input[class=\'refund-edit-amount\'][name*=\'' +
        stockcode +
        '-Goodwill\']:nth-child(1)'
    )
  }

  getRefundIdTitleHearder() {
    return cy.get('.manage-title>h1')
  }

  // get first stock code in the order
  public getFirstStockCodeInOrder() {
    cy.get(
      '.refund-lines-table > div > table > tbody > tr._filter-table-row td:nth-child(5)'
    ).each(($el, index, $list) => {
      const orderedColVal = $el.text()
      const sizeColVal = $el.prev().text()
      if (
        parseInt(orderedColVal) > 0 &&
        sizeColVal != null &&
        sizeColVal != ''
      ) {
        cy.get(
          '.refund-lines-table > div > table > tbody > tr._filter-table-row td:nth-child(5)'
        )
          .eq(index)
          .prev()
          .prev()
          .prev()
          .children('span')
          .invoke('text')
          .then(($stockCode) => {
            cy.wrap($stockCode).as('firstStockCode')
          })
        return false
      }
    })
  }

  public generateRefundInSiteManagement(
    stockcode: any,
    refundReason: string,
    refundComment: string,
    refundQuantity: string,
    goodwillQuantity: string
  ) {
    // Fill refund details
    this.getRefundCheckboxForStockcode(stockcode).click()
    this.getRefundReasonFieldForStockcode(stockcode).select(refundReason)
    this.getRefundCommentFieldForStockcode(stockcode).type(refundComment)
    this.getRefundQuantityFieldForStockcode(stockcode)
      .clear()
      .type(refundQuantity)
    if (parseInt(goodwillQuantity) > 0) {
      this.getGoodwillCheckboxForStockCode(stockcode).click()
      this.getGoodwillReasonForStockCode(stockcode).select(refundReason)
      this.getGoodwillCommentForStockCode(stockcode).type(refundComment)
      this.getGoodwillQuantityFieldForStockcode(stockcode)
        .clear()
        .type(goodwillQuantity)
    }
    this.getRefundTotalField().click()
    this.getRefundTotalField()
      .invoke('val')
      .then(($refundTotalVal) => {
        cy.wrap($refundTotalVal).as('refundTotalCapture')
      })
    this.getGoodwillTotalField()
      .invoke('val')
      .then(($goodwillTotalVal) => {
        cy.wrap($goodwillTotalVal).as('goodwillTotalCapture')
      })
    // Click save and approve
    this.getRefundSaveButton().click()
    this.getRefundApproveButton().click()
    cy.url().should('include', '/OrderManagement/OrderRefundDetail')
  }
}
export const onOrderManagement = new OrderManagement()
