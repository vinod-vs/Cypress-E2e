/// <reference types="cypress" />
/* eslint-disable no-unused-expressions */

import shoppers from '../../../../fixtures/everydayMarket/shoppers.json'
import TestFilter from '../../../../support/TestFilter'
import '../../../../support/login/api/commands/login'
import '../../../../support/search/api/commands/search'
import '../../../../support/sideCart/api/commands/clearTrolley'
import '../../../../support/invoices/api/commands/commands'
import '../../../../support/refunds/api/commands/commands'
import '../../../../support/sideCart/api/commands/addItemsToTrolley'
import '../../../../support/checkout/api/commands/navigateToCheckout'
import '../../../../support/checkout/api/commands/confirmOrder'
import '../../../../support/payment/api/commands/creditcard'
import '../../../../support/payment/api/commands/digitalPayment'
import '../../../../support/rewards/api/commands/rewards'
import '../../../../support/everydayMarket/api/commands/orderApi'
import '../../../../support/everydayMarket/api/commands/marketplacer'
import '../../../../support/everydayMarket/api/commands/utility'
import tests from '../../../../fixtures/everydayMarket/apiTests.json'
import '../../../../support/payment/api/commands/giftCard'
import * as lib from '../../../../support/everydayMarket/api/commands/commonHelpers'

TestFilter(['EDM', 'API', 'feature'], () => {
  describe('[API] RP-5475  Verify WOW & EDM Order more than 5000 cannot be placed using Gift cards', () => {
    before(() => {
      cy.clearCookies({ domain: null })
      cy.clearLocalStorage({ domain: null })
    })

    it('[API] RP-5476  Verify WOW & EDM Order more than 5000 cannot be placed using Gift cards', () => {
      const testData = tests.VerifyEDMAndWOWItemsGCLimit
      const shopper = shoppers.emAccount2
      let shopperId = shopper.shopperId
      let orderId
      let orderReference

      // Login and place the order from testdata
      cy.loginAndPlaceRequiredOrderFromTestdata(shopper, testData).then((response) => {
        orderId = response.Order.OrderId.toString()
        orderReference = response.Order.OrderReference.toString() 
        testData.orderId = orderId
        testData.orderReference = orderReference

        //Verify that the order is cancelled
        cy.ordersApiByShopperIdAndTraderOrderIdWithRetry(shopperId, testData.orderId, {
          function: function (response) {
            if (response.body.invoices[0].wowStatus !== 'Failed') {
              cy.log('wowStatus was ' + response.body.invoices[0].wowStatus + ' instead of Failed')
              throw new Error('wowStatus was ' + response.body.invoices[0].wowStatus + ' instead of Failed')
            }
          },
          retries: 10,
          timeout: 5000
        }).as('finalProjection').then((response) => {

          // MP Order details
          cy.log("Checking MP Order details")
          expect(response.orderId).to.equal(Number(orderId))
          expect(response.shopperId).to.be.equal(Number(shopperId))
          expect(response.orderStatus).to.be.equal('FraudRejected')
          expect(response.thirdPartyOrderId).to.be.null
          expect(response.thirdPartyName).to.be.null
          expect(response.createdTimeStampUtc).to.not.be.null
          expect(response.shippingPdfLink).to.be.null
          expect(response.shippingAmount).to.not.be.null
          expect(response.invoices.length).to.be.equal(1)
          expect(response.invoices[0].wowStatus).to.be.equal('Failed')
          expect(response.invoices[0].lineItems[0].totalAmount).to.be.greaterThan(0)
          expect(response.invoices[0].lineItems[0].quantity).to.be.equal(Number(testData.items[0].quantity))

          cy.log("Checking seller details")
          // Seller details
          expect(response.invoices[0].seller.sellerId).to.not.be.null
          expect(response.invoices[0].seller.sellerName).to.be.equal(testData.items[0].sellerName)

          cy.log("Verifying invoice details after failed order")
          // Verifying Invoice details after failed order
          expect(response.invoices[0].invoiceStatus).to.be.null
          expect(response.invoices[0].wowStatus).to.be.equal('Failed')
          expect(response.invoices[0].wowId).to.not.be.null
          expect(response.invoices[0].lineItems.length).to.be.equal(1)
          expect(response.invoices[0].legacyId).to.not.be.null
          expect(response.invoices[0].legacyIdFormatted).to.not.be.null
          expect(response.invoices[0].invoiceTotal).to.be.greaterThan(0)
          expect(response.invoices[0].updatedTimeStampUtc).to.not.be.null
          expect(response.invoices[0].orderTrackingStatus).to.be.equal('Placed')
          expect(response.invoices[0].pdfLink).to.be.null

          // shipments
          expect(response.invoices[0].shipments.length).to.be.equal(0)
          // Return
          expect(response.invoices[0].returns.length).to.be.equal(0)

          // Line item details
          expect(response.invoices[0].lineItems[0].wowId).to.not.be.null
          expect(response.invoices[0].lineItems[0].lineItemId).to.be.null
          expect(response.invoices[0].lineItems[0].legacyId).to.be.equal(0)
          expect(response.invoices[0].lineItems[0].stockCode).to.be.equal(Number(testData.items[0].stockCode))
          expect(response.invoices[0].lineItems[0].quantity).to.be.equal(Number(testData.items[0].quantity))
          expect(response.invoices[0].lineItems[0].quantityPlaced).to.be.equal(0)
          expect(response.invoices[0].lineItems[0].refundableQuantity).to.be.equal(0)
          expect(response.invoices[0].lineItems[0].salePrice).to.be.greaterThan(0)
          expect(response.invoices[0].lineItems[0].totalAmount).to.be.greaterThan(0)
          expect(response.invoices[0].lineItems[0].variantId).to.not.be.null
          expect(response.invoices[0].lineItems[0].status).to.be.null
          expect(response.invoices[0].lineItems[0].statusFull).to.be.null

          // Shipments Details for line items
          expect(response.invoices[0].lineItems[0].shipment).to.be.null

          // Rewards Details for line items
          expect(response.invoices[0].lineItems[0].reward.offerId).to.not.be.null
          expect(response.invoices[0].lineItems[0].reward.deferredDiscountAmount).to.not.be.null
          expect(response.invoices[0].lineItems[0].reward.quantity).to.be.equal(Number(testData.items[0].quantity))

          // After Order failed, Invoke the events api and verify the events are updated acordingly
          cy.orderEventsApiWithRetry(testData.orderReference, {
            function: function (response) {
              if (!response.body.data.some((element) => element.domainEvent === 'MarketOrderFailed')) {
                cy.log('Expected MarketOrderFailed event is not present')
                throw new Error('Expected MarketOrderFailed event is not present')
              }
            },
            retries: 15,
            timeout: 5000
          }).then((response) => {
            // Verify Market Order is Failed
            lib.verifyEventDetails(response, 'MarketOrderFailed', testData, shopperId, 1)
          })
         
          // Invoke OQS TMO api and validate it against the projection
          cy.getOrderStatus(testData.orderId).then((oqsResponse) => {
            cy.log(JSON.stringify(oqsResponse))
          }).as('oqsResponse')
          
          cy.get('@finalProjection').then((projection) => {
            cy.get('@oqsResponse').then((oqsResponse) => {
          
              // Verify common details
              expect(oqsResponse.OrderId).to.be.equal(Number(testData.orderId))
              expect(oqsResponse.ShopperId).to.be.equal(projection.shopperId)
              expect(oqsResponse.MarketDeliveryStreet1).to.not.be.null
              expect(oqsResponse.MarketDeliveryStreet2).to.not.be.null
              expect(oqsResponse.MarketDeliverySuburb).to.not.be.null
              expect(oqsResponse.MarketDeliveryPostCode).to.not.be.null
              expect(oqsResponse.IsMarketOnly).to.be.equal(false)
              expect(oqsResponse.MarketOrders.length).to.be.greaterThan(0)
              expect(oqsResponse.CurrentStatus).to.be.equal('Received')

              //Verify WOW Items
              const wowItems = testData.items.filter(item => item.isEDMProduct === String(false))
              wowItems.forEach(function (item, k) {
                expect(oqsResponse.OrderProducts[k].Ordered.StockCode).to.be.equal(item.stockCode)
                expect(oqsResponse.OrderProducts[k].Ordered.Quantity).to.be.equal(item.quantity)
                expect(oqsResponse.OrderProducts[k].Ordered.SalePrice.Value).to.be.equal(item.pricePerItem)
                expect(oqsResponse.OrderProducts[k].Ordered.Total).to.be.equal(Number(Number.parseFloat(Number(item.pricePerItem * item.quantity)).toFixed(2)))
              })

              // Verify edm order details
              // Verify the edm products count matches with the invoices count
              expect(oqsResponse.MarketOrders.length).to.be.equal(projection.invoices.length)
              // Verify each edm item
              oqsResponse.MarketOrders.forEach(function (item, i) {
                // Verify the edm items per product/invoice count matches with the lineItems of each invoices count
                expect(oqsResponse.MarketOrders[i].Products.length).to.be.equal(projection.invoices[i].lineItems.length)
                oqsResponse.MarketOrders[i].Products.forEach(function (item, j) {
                  expect(oqsResponse.MarketOrders[i].LegacyIdFormatted).to.be.equal(projection.invoices[i].legacyIdFormatted)
                  expect(oqsResponse.MarketOrders[i].SellerName).to.be.equal(projection.invoices[i].seller.sellerName)

                  //Verify EDM Order Status
                  expect(oqsResponse.MarketOrders[i].Status).to.be.equal('Cancelled')

                  //Verify invoice total,shipping fee and dates
                  expect(oqsResponse.MarketOrders[i].Total).to.be.equal(projection.invoices[i].invoiceTotal)
                  expect(oqsResponse.MarketOrders[i].MarketShippingFee).to.be.equal(projection.shippingAmount)
                  expect(oqsResponse.MarketOrders[i].CreatedDate).to.not.be.null
                  expect(oqsResponse.MarketOrders[i].UpdatedDate).to.not.be.null
                  expect(oqsResponse.MarketOrders[i].DeliveryInfo).to.not.be.null

                  //Verify no shipments
                  expect(projection.invoices[i].shipments).to.be.empty
                  expect(oqsResponse.MarketOrders[i].Shipment.Carrier).to.be.undefined
                  expect(oqsResponse.MarketOrders[i].Shipment.TrackingLink).to.be.undefined
                  expect(oqsResponse.MarketOrders[i].Shipment.TrackingNumber).to.be.undefined

                  //Verify no refunds and no returns
                  expect(projection.invoices[i].refunds).to.be.empty
                  expect(oqsResponse.MarketOrders[i].Refunds).to.be.undefined
                  expect(projection.invoices[i].returns).to.be.empty
                  expect(oqsResponse.MarketOrders[i].Returns).to.be.undefined

                  // Products
                  expect(oqsResponse.MarketOrders[i].Products[j].StockCode).to.be.equal(projection.invoices[i].lineItems[j].stockCode)
                  expect(oqsResponse.MarketOrders[i].Products[j].Quantity).to.be.equal(projection.invoices[i].lineItems[j].quantity)
                  expect(oqsResponse.MarketOrders[i].Products[j].RefundableQuantity).to.be.equal(projection.invoices[i].lineItems[j].refundableQuantity)
                  expect(oqsResponse.MarketOrders[i].Products[j].Total).to.be.equal(projection.invoices[i].lineItems[j].totalAmount)
                  expect(oqsResponse.MarketOrders[i].Products[j].SalePrice).to.be.equal(projection.invoices[i].lineItems[j].salePrice)
                })
              })
            })
          })
        })  
      })
    })  
    
    after(() => {
      cy.log('Test Teardown - Deleting Gift Cards')

      cy.get('@giftcardPaymentInstrumentIds').then((giftcardPaymentInstrumentIds) => {
        cy.log(giftcardPaymentInstrumentIds.length)
        giftcardPaymentInstrumentIds.forEach(instrumentId => {
          cy.removePaymentInstrument(instrumentId.InstrumentId)
        });
      }) 
    })
  })
})