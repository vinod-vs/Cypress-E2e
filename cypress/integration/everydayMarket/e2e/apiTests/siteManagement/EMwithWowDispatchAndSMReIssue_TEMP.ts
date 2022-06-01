/// <reference types="cypress" />
/* eslint-disable no-unused-expressions */

import TestFilter from '../../../../../support/TestFilter'
import '../../../../../support/siteManagement/ui/commands/login'
import '../../../../../support/siteManagement/ui/commands/homepage'
import '../../../../../support/siteManagement/ui/commands/orderManagement'
import '../../../../../support/everydayMarket/api/commands/orderApi'
import '../../../../../support/invoices/api/commands/commands'
import '../../../../../support/refunds/api/commands/commands'

import '../../../../../support/everydayMarket/api/commands/marketplacer'
import '../../../../../support/everydayMarket/api/commands/utility'
import '../../../../../support/everydayMarket/ui/commands/siteManagementHelpers'
import '../../../../../support/everydayMarket/ui/commands/siteManagementValidationHelpers'
import smLogins from '../../../../../fixtures/siteManagement/loginDetails.json'

import '../../../../../support/login/api/commands/login'

import '../../../../../support/everydayMarket/api/commands/orderPlacementHelpers'
import '../../../../../support/rewards/api/commands/rewards'

import '../../../../../support/orders/api/commands/amendOrder'
import * as lib from '../../../../../support/everydayMarket/api/commands/validationHelpers'
import * as commonLib from '../../../../../support/everydayMarket/api/commands/commonHelpers'

import wowDispatchData from '../../../../../fixtures/wowDispatch/wowDispatch.json'
import eventsRequest from '../../../../../fixtures/wowDispatch/wowDispatchDataPrep.json'
import '../../../../../support/wowDispatch/wowStatusUpdates'

import { onOrderManagement } from '../../../../../support/siteManagement/ui/pageObjects/OrderManagement'

TestFilter(['EDM', 'EDM-HYBRID', 'EDM-E2E-HYBRID'], () => {
  describe('[API] RP-5469-EM|SM|EMwithWowDispatchAndSMReIssue', () => {
    before(() => {
      cy.clearCookies({ domain: null })
      cy.clearLocalStorage({ domain: null })
    })

    it('[API] RP-5469-EM|SM|EMwithWowDispatchAndSMReIssue', () => {
      const searchTerm = 'treats' // 'everyday market'
      const purchaseQty = 2
      let shopperId: any
      let req: any
      let orderId: any
      let WoolworthsSubtotal: any
      let edmOrderId: any
      let edmInvoiceId: any
      let reIssueOrderIdNumber: any
      let reIssueOrderIdNumber1: any

      const testData = wowDispatchData.wowDispatchJSON

      // Now UI section to Perform the ReIssue from Site Management So, First Login to SM and verify the order details
      cy.loginToSMAndSearchOrder(smLogins, 140172586)

      //Cypress.Commands.add('performReIssueOnWowOrderOnSM', () => {
      // Perform the ReIssue of Wow items from Site Management
      //cy.get('@finalProjection').then((finalProjection) => {
      // Verify Common OrderReference Number is present on the Order Management SM UI
      // Click on "Woolworths Order" Tab
      onOrderManagement.getWOWTab().click()
      if (
        onOrderManagement
          .getWowLineItemsTable()
          .find(onOrderManagement.getWowLineItemsStockCodeString())
          .contains('465135')
      ) {
        cy.log("Compare the ReIssue 'ISS' CheckBox for the StockCode 465135")
        onOrderManagement
          .getWowLineItemsTable()
          .find(onOrderManagement.getWowLineItemsStockReIssueCheckBoxString())
          .parent()
          .within(function () {
            cy.log(
              "----Now Clicking on the ReIssue 'ISS' CheckBox for the StockCode 465135----"
            )
            cy.get('td').eq(2).click()
          })
        cy.log(
          '----Now Selecting the ReIssue Reason from DropDown box as - Damaged Item----'
        )
        onOrderManagement
          .getWowLineItemsTable()
          .find(onOrderManagement.getWowLineItemsReIssueReasonSelectString())
          .select('Damaged Item')
        cy.log('----Now Enter Text inside the Shoppers Note TextBox----')
        onOrderManagement
          .getWowLineItemsTable()
          .find(onOrderManagement.getWowLineItemsShoppersNoteTextBoxString())
          .type('Shoppers Note for the ReIssue of the Damaged Item')
        cy.log('----Now Enter Text inside the Comment TextBox----')
        onOrderManagement
          .getWowLineItemsTable()
          .find(onOrderManagement.getWowLineItemsCommentTextBoxString())
          .type('Comments for the ReIssue of the Damaged Item')
        cy.log('----Now Click on Save Button to Create the ReIssue----')
        onOrderManagement.getWowSaveButton().click()
        cy.log(
          '---- Verify Reissue Payment Total - Courier Option gets Displayed----'
        )
        onOrderManagement
          .getCourierRadioButton()
          .invoke('text')
          .should('contain', 'Courier')
        cy.log(
          '---- Select ReIssue Delivery Address from the Drop Down Box----'
        )
        onOrderManagement.getCourierDeliveryAddressDropDown().select(1)
        onOrderManagement.getChangeDeliveryWindowDropDown().select(6)
        cy.log('----Now, Entering Text in Delivery Instructions TextBox----')
        onOrderManagement
          .getDeliveryInstructionsTextBox()
          .type('Delivery Instructions for the ReIssue of the Damaged Item')
        cy.log('----Now, Click on Approve Button----')
        onOrderManagement.getWowApproveButton().click()
        cy.wait(Cypress.config('fiveSecondWait'))
        cy.log(
          "----Now, Click on 'Submit and Place Order Button' on 'Confirm your Reissued Order' Screen ----"
        )
        onOrderManagement.getSubmitAndPlaceOrderButton().click()
        cy.wait(Cypress.config('fiveSecondWait'))
        cy.log(
          "----Now, Verify 'Order ID' and 'Reissue Order Total' are displayed ----"
        )
        onOrderManagement
          .getOrderidOnApprovedRefundDetailsScreeen()
          .parent()
          .invoke('text')
          .should('contain', 140172586)
        onOrderManagement
          .getReissueOrderTotalOnApprovedRefundDetailsScreeen()
          .parent()
          .contains('0.00')

        // Starts the Changes on 27th May 2022 To Verify
        //Extract the Reissue Order ID 140175087  from the ReIssue Confirmation Screen
        //Then Search for that ReIssued OrderId and Verify that No EM Tab is present in SM
        //Now, Perform Below Validations on the Trader Website Page- On My Order Details Page for the ReIssued Order-
        //Verify - 'Make changes to my order' and 'Cancel my order' Buttons are NOT Present.

        //Extract the ReIssue Order Id -
        //onOrderManagement.getOrderidOnApprovedRefundDetailsScreeen().parent().invoke('text')//.should('contain', finalProjection.orderId)
        onOrderManagement
          .getReissueOrderId()
          .parent()
          .invoke('text')
          .then((reIssueOrderIdLabelText) => {
            cy.wrap(reIssueOrderIdLabelText).as('reIssueOrderId')
          })

        cy.get('@reIssueOrderId').then((reIssueOrderId) => {
          cy.log(' reIssueOrderId Full Label Text is=' + reIssueOrderId)
          let pattern = /[0-9]+/g
          reIssueOrderIdNumber = String(reIssueOrderId.match(pattern))
          cy.wrap(reIssueOrderIdNumber).as('reIssueOrderIdNumber')
          cy.log('---- reIssueOrderIdNumber is= ' + reIssueOrderIdNumber)

          //Now Search for that ReIssued OrderId extracted Above and Verify that No EM Tab is present in SM details
          // Click on Order Management Tab to Open the Search Screen
          onOrderManagement.getOrderManagementTab().click()
          // Now, Search the ReIssue  Order Id
          cy.searchAnOrderOnSM(reIssueOrderIdNumber)
          //Now, Assert for No EM Tab Present on the ReIssued Order
          onOrderManagement.getEDMTab().should('not.exist')

          //Now, Perform Below Validations on the Trader Website Page- On My Order Details Page for the ReIssued Order
          //Navigate to the Trader Website -> Login -> Click on My Order Details Page OF the ReIssues OrderID-
        }) // ENDS - cy.get('@reIssueOrderId').then((reIssueOrderId) => {
      } //ENDS- IF Condition
      // }) // ENDS - cy.get('@finalProjection').then((finalProjection) => {
      //})  // ENDS-  Cypress.Commands.add('performReIssueOnWowOrderOnSM', () => {
    })
  })
})
