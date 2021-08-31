/// <reference types="cypress" />
/* eslint-disable no-unused-expressions */

import shoppers from '../../../fixtures/everydayMarket/shoppers.json'
import searchBody from '../../../fixtures/search/productSearch.json'
import creditCardPayment from '../../../fixtures/payment/creditcardPayment.json'
import digitalPayment from '../../../fixtures/payment/digitalPayment.json'
import creditcardSessionHeader from '../../../fixtures/payment/creditcardSessionHeader.json'
import confirmOrderParameter from '../../../fixtures/orderConfirmation/confirmOrderParameter.json'
import TestFilter from '../../../support/TestFilter'
import '../../../support/login/api/commands/login'
import '../../../support/search/api/commands/search'
import '../../../support/deliveryDateAndWindow/api/commands/deliveryDateAndWindow'
import '../../../support/sideCart/api/commands/clearTrolley'
import '../../../support/sideCart/api/commands/addItemsToTrolley'
import '../../../support/checkout/api/commands/navigateToCheckout'
import '../../../support/checkout/api/commands/confirmOrder'
import '../../../support/payment/api/commands/creditcard'
import '../../../support/payment/api/commands/digitalPayment'
import '../../../support/rewards/api/commands/rewards'
import '../../../support/everydayMarket/api/commands/orderApi'
import '../../../support/everydayMarket/api/commands/marketplacer'
import '../../../support/everydayMarket/api/commands/utility'
import tests from '../../../fixtures/everydayMarket/apiTests.json'
import * as lib from '../../../support/everydayMarket/api/commands/commonHelpers'

TestFilter(['B2C-API', 'EDM-API'], () => {
  describe('[API] MPPF-902 | EM | MPer | Full cancellation of Everyday Market order via Marketplacer', () => {
    before(() => {
      cy.clearCookies({ domain: null })
      cy.clearLocalStorage({ domain: null })
    })

    it('RP-902 | EM | MPer | Full cancellation of Everyday Market order via Marketplacer', () => {
      const testData = tests.VerifyFullCancellationOfEDMOrder
      let orderId
      let orderReference
      let edmOrderId
      let edmInvoiceId
      let encodedEdmInvoiceId
      let encodedEdmLineitemId
      const shopperId = shoppers.emAccount2.shopperId

      // Login
      cy.loginViaApi(shoppers.emAccount2).then((response) => {
        expect(response).to.have.property('LoginResult', 'Success')
      })

      // Select a regular delivery slot
      cy.getRegularDeliveryTimeSlot(testData).then((response) => {
        cy.fulfilmentWithSpecificDeliveryDateAndTime(testData.deliveryAddressId, testData.timeSlotId, testData.windowDate).then((response) => {
          expect(response).to.have.property('IsSuccessful', true)
          expect(response).to.have.property('IsNonServiced', false)
        })
      })

      // clear the trolley before placing an order
      cy.clearTrolley().then((response) => {
        expect(response).to.have.property('TrolleyItemCount', 0)
        expect(response).to.have.property('TotalTrolleyItemQuantity', 0)
      })

      // Search for the desired products and add them to cart
      searchBody.SearchTerm = testData.searchTerm
      cy.productSearch(searchBody).then((response) => {
        expect(response.SearchResultsCount).to.be.greaterThan(0)

        cy.getTestProductFromProductSearchResponse(response, testData)
      })

      // Checkout, make a CC payment and place the order
      cy.navigateToCheckout().then((response) => {
        expect(response.Model.Order.BalanceToPay).to.be.greaterThan(0)
        digitalPayment.payments[0].amount = response.Model.Order.BalanceToPay
      })
      cy.navigatingToCreditCardIframe().then((response) => {
        expect(response).to.have.property('Success', true)
        creditcardSessionHeader.creditcardSessionId = response.IframeUrl.toString().split('/')[5]
      })
      cy.creditcardPayment(creditCardPayment, creditcardSessionHeader).then((response) => {
        expect(response.status.responseText).to.be.eqls('ACCEPTED')
        digitalPayment.payments[0].paymentInstrumentId = response.itemId
      })
      cy.digitalPay(digitalPayment).then((response) => {
        expect(response.TransactionReceipt).to.not.be.null
        expect(response.PlacedOrderId).to.not.be.null
        confirmOrderParameter.placedOrderId = response.PlacedOrderId
      })

      // Confirm the orders or place the order
      cy.wait(Cypress.config('fiveSecondWait'))
      cy.confirmOrder(confirmOrderParameter).then((response) => {
        expect(response.Order.OrderId).to.eqls(confirmOrderParameter.placedOrderId)
        orderId = response.Order.OrderId.toString()
        orderReference = response.Order.OrderReference.toString()
        testData.orderId = orderId
        testData.orderReference = orderReference
        cy.log('This is the order id: ' + response.Order.OrderId + ', Order ref: ' + response.Order.OrderReference)

        // Verify the order totals are as expected
        lib.verifyOrderTotals(testData, response)

        // Invoke the order api and verify the projection content
        cy.wait(Cypress.config('tenSecondWait') * 3)
        cy.ordersApiByShopperIdAndTraderOrderId(shopperId, orderId).then((response) => {
          edmOrderId = response.invoices[0].legacyIdFormatted
          edmInvoiceId = response.invoices[0].legacyId
          encodedEdmInvoiceId = response.invoices[0].invoiceId
          encodedEdmLineitemId = response.invoices[0].lineItems[0].lineItemId
          testData.edmOrderId = edmOrderId
          testData.edmInvoiceId = edmInvoiceId
        
          testData.encodedEdmInvoiceId = encodedEdmInvoiceId
          testData.encodedEdmLineitemId = encodedEdmLineitemId
          cy.log('This is the MPOrder Id: ' + edmOrderId + ', MPInvoice Id: ' + edmInvoiceId + ' , MP InvoiceId: '+ encodedEdmInvoiceId + ' , MPencodedEdmLineitemId: '+ encodedEdmLineitemId )
          // Verify the projection details
          verifyOrderDetails(response, testData, shopperId)

          // Invoke the events api and verify the content
          cy.wait(Cypress.config('twoSecondWait'))
          cy.events(shopperId, orderId, orderReference).then((response) => {
            lib.verifyEventDetails(response, 0, 'OrderPlaced', 2, testData, shopperId)
            lib.verifyEventDetails(response, 1, 'MarketOrderPlaced', 2, testData, shopperId)
          })

          // Get customers current reward points balance before seller cancellation
          cy.getRewardsCardDetails(testData.rewards.partnerId, testData.rewards.siteId, testData.rewards.posId, testData.rewards.loyaltySiteType, testData.rewards.cardNo).then((response) => {
            expect(response.queryCardDetailsResp.pointBalance).to.be.greaterThan(0)
            testData.rewardPointBefore = response.queryCardDetailsResp.pointBalance
          })

          // Seller cancells all the EM items and verify the events and order statuses
          cy.cancelLineItemInInvoice(encodedEdmInvoiceId, encodedEdmLineitemId, testData.items[0].quantity).then((response) => {
            cy.wait(Cypress.config('tenSecondWait') * 3)
             // After Seller cancellation, Invoke the order api and verify the projection content is updated acordingly for refunds
          cy.ordersApiByShopperIdAndTraderOrderId(shopperId, orderId).then((response) => {
            // Order details
            lib.verifyCommonOrderDetails(response, testData, shopperId)
            // Seller details
            expect(response.invoices[0].seller.sellerId).to.not.be.null
            expect(response.invoices[0].seller.sellerName).to.be.equal(testData.sellerName)
            // Verifying Invoice details after seller cancellation
            expect(response.invoices[0].invoiceStatus).to.be.equal('REFUNDED')
            expect(response.invoices[0].wowStatus).to.be.equal('SellerCancelled')
            expect(response.invoices[0].wowId).to.not.be.null
            expect(response.invoices[0].lineItems.length).to.be.equal(1)
            expect(response.invoices[0].legacyId).to.not.be.null
            expect(response.invoices[0].legacyIdFormatted).to.not.be.null
            expect(response.invoices[0].invoiceTotal).to.be.greaterThan(0)
            expect(response.invoices[0].updatedTimeStampUtc).to.not.be.null
            expect(response.invoices[0].refunds.length).to.be.equal(1)
            expect(response.invoices[0].orderTrackingStatus).to.be.equal('Cancelled')
            expect(response.invoices[0].pdfLink).to.not.be.null
            expect(response.invoices[0].legacyIdFormatted).to.be.equal(testData.edmOrderId)
            // shipments      
            expect(response.invoices[0].shipments.length).to.be.equal(0)
            // Return 
            expect(response.invoices[0].returns.length).to.be.equal(0)
            // Line item details
            expect(response.invoices[0].lineItems[0].wowId).to.not.be.null
            expect(response.invoices[0].lineItems[0].lineItemId).to.not.be.null
            expect(response.invoices[0].lineItems[0].legacyId).to.not.be.null
            expect(response.invoices[0].lineItems[0].stockCode).to.be.equal(Number(testData.items[0].stockCode))
            expect(response.invoices[0].lineItems[0].quantity).to.be.equal(Number(testData.items[0].quantity))
            expect(response.invoices[0].lineItems[0].quantityPlaced).to.be.equal(Number(testData.items[0].quantity))
            expect(response.invoices[0].lineItems[0].refundableQuantity).to.be.equal(0)
            expect(response.invoices[0].lineItems[0].salePrice).to.be.greaterThan(0)
            expect(response.invoices[0].lineItems[0].totalAmount).to.be.greaterThan(0)
            expect(response.invoices[0].lineItems[0].variantId).to.not.be.null
            expect(response.invoices[0].lineItems[0].status).to.be.equal('REFUNDED')            
            expect(response.invoices[0].lineItems[0].statusFull).to.be.null
            // Shipments Details for line items
            expect(response.invoices[0].lineItems[0].shipment).to.be.null
            // Rewards Details for line items
            expect(response.invoices[0].lineItems[0].reward.offerId).to.be.equal('MARKETREWARD')
            expect(response.invoices[0].lineItems[0].reward.deferredDiscountAmount).to.be.equal(0.1)
            expect(response.invoices[0].lineItems[0].reward.quantity).to.be.equal(Number(testData.items[0].quantity))
            // Refund 
            expect(response.invoices[0].refunds[0].id).to.not.be.null
            expect(response.invoices[0].refunds[0].status).to.be.equal('Refunded')
            expect(response.invoices[0].refunds[0].refundAmount).to.be.equal(Number(testData.edmTotal))
            expect(response.invoices[0].refunds[0].refundAmount).to.be.equal(response.invoices[0].invoiceTotal)            
            expect(response.invoices[0].refunds[0].cashAmount).to.be.greaterThan(0)
            expect(response.invoices[0].refunds[0].totalAmount).to.be.greaterThan(0)
            expect(response.invoices[0].refunds[0].recoveredAmount).to.be.greaterThan(0)
            expect(response.invoices[0].refunds[0].createdUtc).to.not.be.null
            expect(response.invoices[0].refunds[0].updatedUtc).to.not.be.null
            expect(response.invoices[0].refunds[0].refundedUtc).to.not.be.null
            expect(response.invoices[0].refunds[0].initiatedBy).to.be.equal("ADMIN")       
                 
            // Refund-> Notes verification
            expect(response.invoices[0].refunds[0].notes[0].id).to.not.be.null
            expect(response.invoices[0].refunds[0].notes[0].note).to.be.equal("Automation refundRequestCreate note: I don't want this")
            expect(response.invoices[0].refunds[0].notes[0].timestamp).to.not.be.null
            expect(response.invoices[0].refunds[0].notes[1].id).to.not.be.null
            expect(response.invoices[0].refunds[0].notes[1].note).to.be.equal("Automation refundRequestReturn note: I don't want this")
            expect(response.invoices[0].refunds[0].notes[1].timestamp).to.not.be.null
            expect(response.invoices[0].refunds[0].notes[2].id).to.not.be.null
            expect(response.invoices[0].refunds[0].notes[2].note).to.be.equal("Auto-refund cancellation")
            expect(response.invoices[0].refunds[0].notes[2].timestamp).to.not.be.null
            // Refund-> refundItems verification
            expect(response.invoices[0].refunds[0].refundItems[0].id).to.not.be.null
            expect(response.invoices[0].refunds[0].refundItems[0].legacyId).to.not.be.null
            expect(response.invoices[0].refunds[0].refundItems[0].reason).equal("Automation Reason: I don't want this")
            expect(response.invoices[0].refunds[0].refundItems[0].quantity).equal(Number(testData.items[0].quantity))
            expect(response.invoices[0].refunds[0].refundItems[0].amount).to.be.greaterThan(0)
            expect(response.invoices[0].refunds[0].refundItems[0].amount).to.be.equal(Number(testData.edmTotal))
            //RefundItems ->lineitems   
            expect(response.invoices[0].refunds[0].refundItems[0].lineItem.stockCode).to.be.equal(Number(testData.items[0].stockCode))         
            expect(response.invoices[0].refunds[0].refundItems[0].lineItem.lineItemId).to.not.be.null
            expect(response.invoices[0].refunds[0].refundItems[0].lineItem.refundableQuantity).to.be.equal(0)
            expect(response.invoices[0].refunds[0].refundItems[0].lineItem.totalAmount).to.be.equal(0)
            expect(response.invoices[0].refunds[0].refundItems[0].lineItem.quantityPlaced).equal(Number(testData.items[0].quantity))
            expect(response.invoices[0].refunds[0].refundItems[0].lineItem.quantity).equal(Number(testData.items[0].quantity))
            expect(response.invoices[0].refunds[0].refundItems[0].lineItem.totalAmount).to.be.equal(0)
            expect(response.invoices[0].refunds[0].refundItems[0].lineItem.variantId).to.not.be.null
            expect(response.invoices[0].refunds[0].refundItems[0].lineItem.variantLegacyId).to.not.be.null
        })//verify order api projection end

          })//seller cancellation end

          // After seller cancellation, Invoke the events api and verify the events are updated acordingly
          cy.wait(Cypress.config('twoSecondWait'))
          cy.events(shopperId, orderId, orderReference).then((response) => {
            // Verify there are only 7 events. New event after seller cancellattion 
            lib.verifyEventDetails(response, 2, 'RefundRequestUpdate', 7, testData, shopperId)
            lib.verifyEventDetails(response, 3, 'RefundRequestUpdate', 7, testData, shopperId)  
            lib.verifyEventDetails(response, 4, 'RefundRequestUpdate', 7, testData, shopperId)  
            lib.verifyEventDetails(response, 5, 'MarketOrderRefund', 7, testData, shopperId)  
            lib.verifyEventDetails(response, 6, 'RefundCompleted', 7, testData, shopperId)              
          })

          // Verify the reward points are not credited to customers card after seller full cancellation of EM order
          // Get customers current reward points balance after seller cancellation
          cy.getRewardsCardDetails(testData.rewards.partnerId, testData.rewards.siteId, testData.rewards.posId, testData.rewards.loyaltySiteType, testData.rewards.cardNo).then((response) => {
              expect(response.queryCardDetailsResp.pointBalance).to.be.greaterThan(0)
              expect(response.queryCardDetailsResp.pointBalance).to.be.equal(testData.rewardPointBefore)           
          })

        })
      })
    })
  })
})

function verifyOrderDetails(response, testData, shopperId) {
  // Common Order details
  lib.verifyCommonOrderDetails(response, testData, shopperId)

  // Seller details
  expect(response.invoices[0].seller.sellerId).to.not.be.null
  expect(response.invoices[0].seller.sellerName).to.be.equal(testData.sellerName)

  // Invoice details
  expect(response.invoices[0].invoiceStatus).to.be.equal('PAID')
  expect(response.invoices[0].wowId).to.not.be.null
  expect(response.invoices[0].wowStatus).to.be.equal('Placed')
  expect(response.invoices[0].seller.sellerId).to.not.be.null
  expect(response.invoices[0].seller.sellerName).to.not.be.null
  expect(response.invoices[0].shipments.length).to.be.equal(0)
  expect(response.invoices[0].lineItems.length).to.be.equal(1)
  expect(response.invoices[0].legacyId).to.not.be.null
  expect(response.invoices[0].legacyIdFormatted).to.not.be.null
  expect(response.invoices[0].invoiceTotal).to.be.greaterThan(0)
  expect(response.invoices[0].updatedTimeStampUtc).to.not.be.null
  expect(response.invoices[0].refunds.length).to.be.equal(0)
  expect(response.invoices[0].orderTrackingStatus).to.be.equal('Received')
  expect(response.invoices[0].pdfLink).to.not.be.null
  expect(response.invoices[0].legacyIdFormatted).to.be.equal(testData.edmOrderId)
  // Line item details
  expect(response.invoices[0].lineItems[0].wowId).to.not.be.null
  expect(response.invoices[0].lineItems[0].lineItemId).to.not.be.null
  expect(response.invoices[0].lineItems[0].legacyId).to.not.be.null
  expect(response.invoices[0].lineItems[0].stockCode).to.be.equal(Number(testData.items[0].stockCode))
  expect(response.invoices[0].lineItems[0].quantity).to.be.equal(Number(testData.items[0].quantity))
  expect(response.invoices[0].lineItems[0].quantityPlaced).to.be.equal(Number(testData.items[0].quantity))
  expect(response.invoices[0].lineItems[0].refundableQuantity).to.be.equal(0)
  expect(response.invoices[0].lineItems[0].salePrice).to.be.greaterThan(0)
  expect(response.invoices[0].lineItems[0].totalAmount).to.be.greaterThan(0)
  expect(response.invoices[0].lineItems[0].variantId).to.not.be.null
  expect(response.invoices[0].lineItems[0].variantLegacyId).to.not.be.null
  // Rewards Details
  expect(response.invoices[0].lineItems[0].reward.offerId).to.be.equal('MARKETREWARD')
  expect(response.invoices[0].lineItems[0].reward.deferredDiscountAmount).to.be.equal(0.1)
  expect(response.invoices[0].lineItems[0].reward.quantity).to.be.equal(Number(testData.items[0].quantity))
}
