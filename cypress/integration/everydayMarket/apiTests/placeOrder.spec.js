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
import '../../../support/everydayMarket/api/commands/orderApi'
import '../../../support/everydayMarket/api/commands/marketplacer'
import '../../../support/everydayMarket/api/commands/utility'
import tests from '../../../fixtures/everydayMarket/apiTests.json'

TestFilter(['API'], () => {
  describe('[API] RP-5039 | EM | MPer | Full dispatch Everyday Market order via Marketplacer', () => {
    before(() => {
      cy.clearCookies({ domain: null })
      cy.clearLocalStorage({ domain: null })
    })

    it('RP-5039 | EM | MPer | Full dispatch Everyday Market order via Marketplacer', () => {
      cy.loginViaApi(shoppers.emAccount2).then((response) => {
        expect(response).to.have.property('LoginResult', 'Success')
      })

      cy.getRegularDeliveryTimeSlot(tests.WowPlusEMOrderTest1).then((response) => {
        cy.fulfilmentWithSpecificDeliveryDateAndTime(tests.WowPlusEMOrderTest1.deliveryAddressId, tests.WowPlusEMOrderTest1.timeSlotId, tests.WowPlusEMOrderTest1.windowDate).then((response) => {
          expect(response).to.have.property('IsSuccessful', true)
          expect(response).to.have.property('IsNonServiced', false)
        })
      })

      cy.clearTrolley().then((response) => {
        expect(response).to.have.property('TrolleyItemCount', 0)
        expect(response).to.have.property('TotalTrolleyItemQuantity', 0)
      })

      searchBody.SearchTerm = tests.WowPlusEMOrderTest1.searchTerm
      cy.productSearch(searchBody).then((response) => {
        expect(response.SearchResultsCount).to.be.greaterThan(0)

        cy.getTestProductFromProductSearchResponse(response, tests.WowPlusEMOrderTest1)
      })

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

      let orderId
      let orderReference
      let edmOrderId
      let edmInvoiceId
      const shopperId = shoppers.emAccount2.shopperId
      cy.wait(Cypress.config('fiveSecondWait'))
      cy.confirmOrder(confirmOrderParameter).then((response) => {
        expect(response.Order.OrderId).to.eqls(confirmOrderParameter.placedOrderId)
        orderId = response.Order.OrderId.toString()
        orderReference = response.Order.OrderReference.toString()
        tests.WowPlusEMOrderTest1.orderId = orderId
        tests.WowPlusEMOrderTest1.orderReference = orderReference
        cy.log('This is the order id: ' + response.Order.OrderId + ', Order ref: ' + response.Order.OrderReference)

        cy.wait(Cypress.config('tenSecondWait') * 3)
        cy.ordersApiByShopperIdAndTraderOrderId(shopperId, orderId).then((response) => {
          edmOrderId = response.invoices[0].legacyIdFormatted
          edmInvoiceId = response.invoices[0].legacyId
          tests.WowPlusEMOrderTest1.edmOrderId = edmOrderId
          tests.WowPlusEMOrderTest1.edmInvoiceId = edmInvoiceId
          cy.log('This is the MPOrder Id: ' + edmOrderId + ', MPInvoice Id: ' + edmInvoiceId)
          cy.log('Testdata JSON: ' + JSON.stringify(tests.WowPlusEMOrderTest1))
          verifyOrderDetails(response, tests.WowPlusEMOrderTest1, shopperId)

          cy.ordersByInvoice(edmOrderId).then((response) => {
            verifyOrderDetails(response, tests.WowPlusEMOrderTest1, shopperId)
          })

          cy.wait(Cypress.config('twoSecondWait'))
          cy.events(shopperId, orderId, orderReference).then((response) => {
            verifyEventDetails(response, tests.WowPlusEMOrderTest1, shopperId)
          })

          // Dispatch the complete order from MP and verify the events and order statuses
          cy.fullDispatchAnInvoice(tests.WowPlusEMOrderTest1.edmInvoiceId, tests.WowPlusEMOrderTest1.trackingNumber, tests.WowPlusEMOrderTest1.carrier, tests.WowPlusEMOrderTest1.sellerName).then((response) => {
            cy.wait(Cypress.config('tenSecondWait') * 3)
            cy.ordersApiByShopperIdAndTraderOrderId(shopperId, orderId).then((response) => {
              // Order details
              expect(response.orderId).to.equal(Number(tests.WowPlusEMOrderTest1.orderId))
              expect(response.orderReference).to.be.equal(tests.WowPlusEMOrderTest1.orderReference)
              expect(response.shopperId).to.be.equal(Number(shopperId))
              expect(response.orderStatus).to.be.equal('Placed')
              expect(response.thirdPartyOrderId).to.not.be.null
              expect(response.thirdPartyName).to.be.equal('Marketplacer')
              expect(response.createdTimeStampUtc).to.not.be.null
              expect(response.shippingPdfLink).to.not.be.null
              expect(response.invoices.length).to.be.equal(1)
              // Invoice details
              expect(response.invoices[0].invoiceStatus).to.be.equal('SENT')
              expect(response.invoices[0].wowStatus).to.be.equal('Shipped')
              expect(response.invoices[0].seller.sellerId).to.not.be.null
              expect(response.invoices[0].seller.sellerName).to.be.equal(tests.WowPlusEMOrderTest1.sellerName)
              expect(response.invoices[0].shipments.length).to.be.equal(1)
              expect(response.invoices[0].lineItems.length).to.be.equal(1)
              expect(response.invoices[0].legacyId).to.not.be.null
              expect(response.invoices[0].legacyIdFormatted).to.not.be.null
              expect(response.invoices[0].invoiceTotal).to.be.greaterThan(0)
              expect(response.invoices[0].updatedTimeStampUtc).to.not.be.null
              expect(response.invoices[0].refunds.length).to.be.equal(0)
              expect(response.invoices[0].orderTrackingStatus).to.be.equal('Shipped')
              expect(response.invoices[0].pdfLink).to.not.be.null
              expect(response.invoices[0].legacyIdFormatted).to.be.equal(tests.WowPlusEMOrderTest1.edmOrderId)
              // Line item details
              expect(response.invoices[0].lineItems[0].lineItemId).to.not.be.null
              expect(response.invoices[0].lineItems[0].legacyId).to.not.be.null
              expect(response.invoices[0].lineItems[0].stockCode).to.be.equal(Number(tests.WowPlusEMOrderTest1.items[0].stockCode))
              expect(response.invoices[0].lineItems[0].quantity).to.be.equal(Number(tests.WowPlusEMOrderTest1.items[0].quantity))
              expect(response.invoices[0].lineItems[0].salePrice).to.be.greaterThan(0)
              expect(response.invoices[0].lineItems[0].variantId).to.not.be.null
              // Shipments
              expect(response.invoices[0].shipments.length).to.be.equal(1)
              expect(response.invoices[0].shipments[0].carrier).to.be.equal(tests.WowPlusEMOrderTest1.carrier)
              expect(response.invoices[0].shipments[0].shipmentItemId).to.not.be.null
              expect(response.invoices[0].shipments[0].trackingLink).to.not.be.null
              expect(response.invoices[0].shipments[0].trackingNumber).to.be.equal(tests.WowPlusEMOrderTest1.trackingNumber)
              expect(response.invoices[0].shipments[0].dispatchedAtUtc).to.not.be.null
              expect(response.invoices[0].shipments[0].shippedItems.length).to.be.equal(1)
              expect(response.invoices[0].shipments[0].shippedItems[0].variantId).to.be.equal(response.invoices[0].lineItems[0].variantId)
              expect(response.invoices[0].shipments[0].shippedItems[0].stockCode).to.be.equal(Number(tests.WowPlusEMOrderTest1.items[0].stockCode))
              expect(response.invoices[0].shipments[0].shippedItems[0].quantity).to.be.equal(Number(tests.WowPlusEMOrderTest1.items[0].quantity))

              cy.wait(Cypress.config('twoSecondWait'))
              cy.events(shopperId, orderId, orderReference).then((response) => {
                expect(response.data).to.have.length(4)
                // Verify there are only 4 events. New event after dispatch is MarketOrderShipmentCreate
                expect(response.data[2].orderId).to.equal(Number(tests.WowPlusEMOrderTest1.orderId))
                expect(response.data[2].orderReference).to.be.equal(tests.WowPlusEMOrderTest1.orderReference)
                expect(response.data[2].shopperId).to.be.equal(Number(shopperId))
                expect(response.data[2].domainEvent).to.be.equal('MarketOrderShipmentCreate')
                expect(response.data[2].payload).to.not.be.null
                // Verify there are only 4 events. New event after dispatch is "MarketOrderDispatched"
                expect(response.data[3].orderId).to.equal(Number(tests.WowPlusEMOrderTest1.orderId))
                expect(response.data[3].orderReference).to.be.equal(tests.WowPlusEMOrderTest1.orderReference)
                expect(response.data[3].shopperId).to.be.equal(Number(shopperId))
                expect(response.data[3].domainEvent).to.be.equal('MarketOrderDispatched')
                expect(response.data[3].payload).to.not.be.null
              })
            })
          })
        })
      })
    })
  })
})

function verifyEventDetails (response, testData, shopperId) {
  // Verify OrderPlaced event contents
  expect(response.data[0].orderId).to.equal(Number(testData.orderId))
  expect(response.data[0].orderReference).to.be.equal(testData.orderReference)
  expect(response.data[0].shopperId).to.be.equal(Number(shopperId))
  expect(response.data[0].domainEvent).to.be.equal('OrderPlaced')
  expect(response.data[0].payload).to.not.be.null
  // Verify MarketOrderPlaced event contents
  expect(response.data[1].orderId).to.equal(Number(testData.orderId))
  expect(response.data[1].orderReference).to.be.equal(testData.orderReference)
  expect(response.data[1].shopperId).to.be.equal(Number(shopperId))
  expect(response.data[1].domainEvent).to.be.equal('MarketOrderPlaced')
  expect(response.data[1].payload).to.not.be.null
  // Verify there are only 2 events
  expect(response.data).to.have.length(2)
}
function verifyOrderDetails (response, testData, shopperId) {
  // Order details
  expect(response.orderId).to.equal(Number(testData.orderId))
  expect(response.orderReference).to.be.equal(testData.orderReference)
  expect(response.shopperId).to.be.equal(Number(shopperId))
  expect(response.orderStatus).to.be.equal('Placed')
  expect(response.thirdPartyOrderId).to.not.be.null
  expect(response.thirdPartyName).to.be.equal('Marketplacer')
  expect(response.createdTimeStampUtc).to.not.be.null
  expect(response.shippingPdfLink).to.not.be.null
  expect(response.invoices.length).to.be.equal(1)
  // Invoice details
  expect(response.invoices[0].invoiceStatus).to.be.equal('PAID')
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
  expect(response.invoices[0].lineItems[0].lineItemId).to.not.be.null
  expect(response.invoices[0].lineItems[0].legacyId).to.not.be.null
  expect(response.invoices[0].lineItems[0].stockCode).to.be.equal(Number(testData.items[0].stockCode))
  expect(response.invoices[0].lineItems[0].quantity).to.be.equal(Number(testData.items[0].quantity))
  expect(response.invoices[0].lineItems[0].salePrice).to.be.greaterThan(0)
  expect(response.invoices[0].lineItems[0].variantId).to.not.be.null
  // expect(response.invoices[0].lineItems[0].status).to.be.equal('ALLOCATED')
}
