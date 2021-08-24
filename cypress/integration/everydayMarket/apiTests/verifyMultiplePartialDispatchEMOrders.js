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
import * as lib from '../../../support/everydayMarket/api/commands/commonHelpers'

TestFilter(['B2C-API', 'EDM-API'], () => {
  describe('[API] MPPF-903 | EM | MPer | Multiple Partial Dispatch Everyday Market order via Marketplacer', () => {
    before(() => {
      cy.clearCookies({ domain: null })
      cy.clearLocalStorage({ domain: null })
    })

    it('MPPF-903 | EM | MPer | Multiple Partial Dispatch Everyday Market order via Marketplacer', () => {
      const testData = tests.VerifyFullyDispatchedEDMOrder

      cy.loginViaApi(shoppers.emAccount2).then((response) => {
        expect(response).to.have.property('LoginResult', 'Success')
      })

      cy.getRegularDeliveryTimeSlot(testData).then((response) => {
        cy.fulfilmentWithSpecificDeliveryDateAndTime(testData.deliveryAddressId, testData.timeSlotId, testData.windowDate).then((response) => {
          expect(response).to.have.property('IsSuccessful', true)
          expect(response).to.have.property('IsNonServiced', false)
        })
      })

      cy.clearTrolley().then((response) => {
        expect(response).to.have.property('TrolleyItemCount', 0)
        expect(response).to.have.property('TotalTrolleyItemQuantity', 0)
      })

      searchBody.SearchTerm = testData.searchTerm
      cy.productSearch(searchBody).then((response) => {
        expect(response.SearchResultsCount).to.be.greaterThan(0)

        cy.getTestProductFromProductSearchResponse(response, testData)
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
      let lineItemLegacyId
      let trackingId1
      let trackingId2
      const shopperId = shoppers.emAccount2.shopperId
      cy.wait(Cypress.config('fiveSecondWait'))
      cy.confirmOrder(confirmOrderParameter).then((response) => {
        expect(response.Order.OrderId).to.eqls(confirmOrderParameter.placedOrderId)
        orderId = response.Order.OrderId.toString()
        orderReference = response.Order.OrderReference.toString()
        testData.orderId = orderId
        testData.orderReference = orderReference
        cy.log('This is the order id: ' + response.Order.OrderId + ', Order ref: ' + response.Order.OrderReference)

        cy.wait(Cypress.config('tenSecondWait') * 3)
        cy.ordersApiByShopperIdAndTraderOrderId(shopperId, orderId).then((response) => {
          lineItemLegacyId = response.invoices[0].lineItems[0].legacyId
          edmOrderId = response.invoices[0].legacyIdFormatted
          edmInvoiceId = response.invoices[0].legacyId
          testData.edmOrderId = edmOrderId
          testData.edmInvoiceId = edmInvoiceId
          cy.log('This is the MPOrder Id: ' + edmOrderId + ', MPInvoice Id: ' + edmInvoiceId)
          cy.log('Testdata JSON: ' + JSON.stringify(testData))
          verifyOrderDetails(response, testData, shopperId)

          cy.ordersByInvoice(edmOrderId).then((response) => {
            verifyOrderDetails(response, testData, shopperId)
          })

          cy.wait(Cypress.config('twoSecondWait'))
          cy.events(shopperId, orderId, orderReference).then((response) => {
            lib.verifyEventDetails(response, 0, 'OrderPlaced', 2, testData, shopperId)
            lib.verifyEventDetails(response, 1, 'MarketOrderPlaced', 2, testData, shopperId)
          })

          // Dispatch partial order with a unique tracking id

          trackingId1 = lib.generateRandomString()
          cy.log('First Tracking Id :' + trackingId1)
          cy.partialDispatchOfLineItemsInInvoice(testData.edmInvoiceId, lineItemLegacyId, 1, trackingId1, testData.carrier, testData.sellerName).then((response) => {
            cy.log('Partial Dispatch Response 1: ' + JSON.stringify(response))
            expect(response.data.attributes.shipment_tracking_number).to.be.equal(trackingId1)
            expect(response.data.attributes.shipment_carrier).to.be.equal(testData.carrier)
            expect(Number(response.data.relationships.invoice.id)).to.be.equal(testData.edmInvoiceId)
            expect(Number(response.data.relationships.line_items[0].id)).to.be.equal(lineItemLegacyId)
            expect(Number(response.included[0].id)).to.be.equal(lineItemLegacyId)
            expect(Number(response.included[0].attributes.invoice_id)).to.be.equal(testData.edmInvoiceId)
            expect(Number(response.included[1].attributes.line_item_id)).to.be.equal(lineItemLegacyId)
          })

          // Dispatch another partial order with a unique tracking id
          trackingId2 = lib.generateRandomString()
          cy.log('Second Tracking Id :' + trackingId2)
          cy.partialDispatchOfLineItemsInInvoice(testData.edmInvoiceId, lineItemLegacyId, 1, trackingId2, testData.carrier, testData.sellerName).then((response) => {
            cy.log('Partial Dispatch Response 2: ' + JSON.stringify(response))
            expect(response.data.attributes.shipment_tracking_number).to.be.equal(trackingId2)
            expect(response.data.attributes.shipment_carrier).to.be.equal(testData.carrier)
            expect(Number(response.data.relationships.invoice.id)).to.be.equal(testData.edmInvoiceId)
            expect(Number(response.data.relationships.line_items[0].id)).to.be.equal(lineItemLegacyId)
            expect(Number(response.included[0].id)).to.be.equal(lineItemLegacyId)
            expect(Number(response.included[0].attributes.invoice_id)).to.be.equal(testData.edmInvoiceId)
            expect(Number(response.included[1].attributes.line_item_id)).to.be.equal(lineItemLegacyId)
          })
        })
      })
    })
  })
})

function verifyOrderDetails (response, testData, shopperId) {
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
  // expect(response.invoices[0].lineItems[0].status).to.be.equal('ALLOCATED')
}
