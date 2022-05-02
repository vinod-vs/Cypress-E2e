import { onOrderManagement } from '../pageObjects/OrderManagement'
import { OrderManagementMenu } from './OrderManagementMenu'

Cypress.Commands.add('selectOrderManagementSubMenu', (menuToSelect) => {
  switch (menuToSelect) {
    case OrderManagementMenu.CUSTOMER_SEARCH:
      onOrderManagement.getCustomerSearchMenu().click()
      break
    case OrderManagementMenu.USER_LOCKING:
      onOrderManagement.getUserLockingMenu().click()
      break
    default:
      onOrderManagement.getCustomerSearchButton().click()
      break
  }
})

Cypress.Commands.add('searchOrder', (orderId) => {
  onOrderManagement.getOrderIDTextField().click({ force: true })
  cy.wait(2000)
  onOrderManagement.getOrderIDTextField().should('be.visible').type(orderId)
  onOrderManagement.getSearchButton().should('be.visible').click()
  cy.contains('#manage-title-panel > #manage-title-area > .manage-title > h1', orderId, { timeout: 60000 })
})

Cypress.Commands.add('searchCustomerByEmailInSM', (email) => {
  onOrderManagement.getEmailAddressTextField().click({ force: true })
  cy.wait(2000)
  onOrderManagement.getEmailAddressTextField().should('be.visible').type(email)
  onOrderManagement.getCustomerSearchButton().should('be.visible').click()
  cy.contains('#manage-title-panel > #manage-title-area > .manage-title > h1', 'Customer Maintenance', { timeout: 60000 })
})

Cypress.Commands.add(
  'createARefund',
  (stockcode, refundReason, refundComment, refundQuantity, goodwillAmount) => {
    // Fill refund details
    onOrderManagement.getRefundCheckboxForStockcode(stockcode).click()
    onOrderManagement
      .getRefundReasonFieldForStockcode(stockcode)
      .select(refundReason)
    onOrderManagement
      .getRefundCommentFieldForStockcode(stockcode)
      .type(refundComment)
    onOrderManagement.getRefundQuantityFieldForStockcode(stockcode).clear()
    onOrderManagement
      .getRefundQuantityFieldForStockcode(stockcode)
      .type(refundQuantity)

    if (goodwillAmount > 0) {
      onOrderManagement.getGoodwillTotalField().clear()
      onOrderManagement.getGoodwillTotalField().type(goodwillAmount)
    }

    // Click save and approve
    onOrderManagement.getRefundSaveButton().click()
    onOrderManagement.getRefundApproveButton().click()
  }
)

Cypress.Commands.add(
  'refundShippingFee',
  (refundReason, refundComment, goodwillAmount) => {
    // Fill refund details
    onOrderManagement.getRefundShippingFeeCheckbox().click()
    onOrderManagement.getRefundShippingFeeReasonField().select(refundReason)
    onOrderManagement.getRefundShippingFeeCommentField().type(refundComment)

    if (goodwillAmount > 0) {
      onOrderManagement.getGoodwillTotalField().clear()
      onOrderManagement.getGoodwillTotalField().type(goodwillAmount)
    }

    // Click save and approve
    onOrderManagement.getRefundSaveButton().click()
    onOrderManagement.getRefundApproveButton().click()
  }
)

Cypress.Commands.add('clickEDMTab', () => {
  onOrderManagement.getEDMTab().click()
})
