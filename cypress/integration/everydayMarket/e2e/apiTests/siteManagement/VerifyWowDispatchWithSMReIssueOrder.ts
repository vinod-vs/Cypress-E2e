/// <reference types="cypress" />
/* eslint-disable no-unused-expressions */

import TestFilter from '../../../../../support/TestFilter'
import '../../../../../support/siteManagement/ui/commands/login'
import '../../../../../support/siteManagement/ui/commands/homepage'
import '../../../../../support/siteManagement/ui/commands/orderManagement'
import '../../../../../support/everydayMarket/api/commands/orderApi'
import '../../../../../support/invoices/api/commands/commands'
import '../../../../../support/refunds/api/commands/commands'
import shoppers from '../../../../../fixtures/everydayMarket/shoppers.json'

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
      const searchTerm = 'pets' // 'everyday market'
      const purchaseQty = 2
      //let shopperId: any
      let req: any
      let orderId: any
      let WoolworthsSubtotal: any
      let edmOrderId: any
      let edmInvoiceId: any

      let reIssueOrderIdNumber

      const shopperId = shoppers.emAccountWithRegressionSMDispatchReIssueOrder.shopperId
      const testData = wowDispatchData.wowDispatchJSON

      cy.loginViaApiAndHandle2FA(shoppers.emAccountWithRegressionSMDispatchReIssueOrder)

      cy.prepareAnySingleLineItemWowAndEdmOrder(searchTerm, purchaseQty)
      cy.placeOrderUsingCreditCard().as('confirmedTraderOrder')

      cy.get('@confirmedTraderOrder').then((confirmedOrder) => {
        req = {
          ...eventsRequest,
          shopperId: shopperId,
          orderId: confirmedOrder.Order.OrderId,
          orderReference: confirmedOrder.Order.OrderReference,
          WoolworthsSubtotal: confirmedOrder.Order.WoolworthsSubtotal,
        }
        cy.wrap(req.orderId).as('orderId')
        cy.wrap(WoolworthsSubtotal).as('WoolworthsSubtotal')

        cy.orderEventsApiWithRetry(req.orderReference, {
          function: function (response) {
            if (
              !response.body.data.some(
                (element) => element.domainEvent === 'OrderPlaced'
              ) ||
              !response.body.data.some(
                (element) => element.domainEvent === 'MarketOrderPlaced'
              )
            ) {
              cy.log('Expected OrderPlaced & MarketOrderPlaced to be present')
              throw new Error(
                'Expected OrderPlaced & MarketOrderPlaced to be present'
              )
            }
          },
          retries: Cypress.env('marketApiRetryCount'),
          timeout: 10000,
        })

        cy.ordersApiByShopperIdAndTraderOrderIdWithRetry(
          req.shopperId,
          req.orderId,
          {
            function: function (response) {
              if (response.body.invoices[0].wowStatus !== 'Placed') {
                cy.log(
                  'wowStatus was ' +
                    response.body.invoices[0].wowStatus +
                    ' instead of Placed'
                )
                throw new Error(
                  'wowStatus was ' +
                    response.body.invoices[0].wowStatus +
                    ' instead of Placed'
                )
              }
            },
            retries: Cypress.env('marketApiRetryCount'),
            timeout: Cypress.env('marketApiTimeout'),
          }
        )
          .as('finalProjection')
          .then((response) => {
            edmOrderId = response.invoices[0].legacyIdFormatted
            edmInvoiceId = response.invoices[0].legacyId
            cy.log(
              'In finalProjection the MPOrder Id: ' +
                edmOrderId +
                ', and MPInvoice Id: ' +
                edmInvoiceId
            )
          })

        // Now Calling WowDispatch'UpdateCompletedOrder'
        cy.wowDispatchUpdateCompletedOrder(
          req.shopperId,
          req.orderId,
          req.WoolworthsSubtotal,
          testData
        )
      })

      // Now UI section to Perform the ReIssue from Site Management So, First Login to SM and verify the order details
      cy.get('@finalProjection').then((response) => {
        cy.loginToSMAndSearchOrder(smLogins, testData.OrderID)
        // Verify that Wow Order Status is displayed as 'Dispatched' under 'Woolworths orders' Tab
        cy.performReIssueOnWowOrderOnSM() // Perform ReIssue from the SM UI using "Woolworths Orders" Tab
      })

      Cypress.Commands.add('performReIssueOnWowOrderOnSM', () => {
        // Perform the ReIssue of Wow items from Site Management
        cy.get('@finalProjection').then((finalProjection) => {
          // Verify Common OrderReference Number is present on the Order Management SM UI
          cy.log(
            'In finalProjection the OrderReference Number is= ' +
              finalProjection.orderReference
          )
          onOrderManagement
            .getOrderReference()
            .parent()
            .invoke('text')
            .should('contain', finalProjection.orderReference)
          // Click on "Woolworths Order" Tab
          onOrderManagement.getWOWTab().click()
          //  cy.wait(Cypress.config("fiveSecondWait"));
          onOrderManagement
            .getWOWTabOrderId()
            .parent()
            .invoke('text')
            .should('contain', finalProjection.orderId)
          // Verify Wow 'OrderStatus' is 'Dispatched' Under the "Woolworths Order" Tab
          onOrderManagement
            .getWOWTabOrderStatus()
            .parent()
            .invoke('text')
            .should('contain', 'Dispatched')

          if (
            onOrderManagement
              .getWowLineItemsTable()
              .find(onOrderManagement.getWowLineItemsStockCodeString())
              .contains('465135')
          ) {
            cy.log(
              "Compare the ReIssue 'ISS' CheckBox for the StockCode 465135"
            )
            onOrderManagement
              .getWowLineItemsTable()
              .find(
                onOrderManagement.getWowLineItemsStockReIssueCheckBoxString()
              )
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
              .find(
                onOrderManagement.getWowLineItemsReIssueReasonSelectString()
              )
              .select('Damaged Item')
            cy.log('----Now Enter Text inside the Shoppers Note TextBox----')
            onOrderManagement
              .getWowLineItemsTable()
              .find(
                onOrderManagement.getWowLineItemsShoppersNoteTextBoxString()
              )
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
            cy.log(
              '----Now, Entering Text in Delivery Instructions TextBox----'
            )
            onOrderManagement
              .getDeliveryInstructionsTextBox()
              .type('Delivery Instructions for the ReIssue of the Damaged Item')
            cy.log('----Now, Click on Approve Button----')
            onOrderManagement.getWowApproveButton().click()
            cy.wait(Cypress.config('tenSecondWait'))
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
              .should('contain', finalProjection.orderId)
            onOrderManagement
              .getReissueOrderTotalOnApprovedRefundDetailsScreeen()
              .parent()
              .contains('0.00')
            //Extract the ReIssue Order Id -
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
              cy.log('ReIssue Order Id Generated is=' + reIssueOrderIdNumber)
              //Now, Search for that ReIssued OrderId in Site Management
              cy.searchAnOrderOnSM(reIssueOrderIdNumber)
              // And Verify that No EM Tab is present in SM for the ReIssued OrderId
              onOrderManagement.getEDMTab().should('not.exist')
            })
          }
        })
      })
    })
  })
})
