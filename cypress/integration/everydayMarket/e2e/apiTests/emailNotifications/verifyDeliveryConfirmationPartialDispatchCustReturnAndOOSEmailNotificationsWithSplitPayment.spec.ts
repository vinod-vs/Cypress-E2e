/// <reference types="cypress" />
/* eslint-disable no-unused-expressions */
import shoppers from '../../../../../fixtures/everydayMarket/shoppers.json'
import TestFilter from '../../../../../support/TestFilter'
import '../../../../../support/login/api/commands/login'
import '../../../../../support/search/api/commands/search'
import '../../../../../support/fulfilment/api/commands/fulfilment'
import '../../../../../support/sideCart/api/commands/clearTrolley'
import '../../../../../support/invoices/api/commands/commands'
import '../../../../../support/refunds/api/commands/commands'
import '../../../../../support/sideCart/api/commands/addItemsToTrolley'
import '../../../../../support/checkout/api/commands/navigateToCheckout'
import '../../../../../support/checkout/api/commands/confirmOrder'
import '../../../../../support/payment/api/commands/creditcard'
import '../../../../../support/payment/api/commands/digitalPayment'
import '../../../../../support/rewards/api/commands/rewards'
import '../../../../../support/everydayMarket/api/commands/orderApi'
import '../../../../../support/everydayMarket/api/commands/marketplacer'
import '../../../../../support/everydayMarket/api/commands/utility'
import '../../../../../support/mailosaur/api/commands/mailosaurHelpers'
import tests from '../../../../../fixtures/everydayMarket/apiTests.json'
import * as lib from '../../../../../support/everydayMarket/api/commands/commonHelpers'
import '../../../../../support/rewards/api/commands/rewards'
import rewardsDetails from '../../../../../fixtures/everydayMarket/rewards.json'

const { JSDOM } = require('jsdom')
const testData: any = tests.VerifyEmailNotifications
let orderId: any
let orderReference: any
let edmOrderId: any
let edmInvoiceId: any
const shopper: any = shoppers.emailTest1
// const shopper: any = shoppers.emAccount2
const shopperId: any = shopper.shopperId
const emailId: any = shopper.email
let lineItemLegacyId: any
let encodedEdmInvoiceId: any
let encodedEdmLineitemId: any
const sentFrom: string = 'shoponline@woolworths.com.au'
let rewardsCardNumber: any = shopper.rewardsCardNumber

TestFilter(['EDM', 'API', 'EDM-E2E-API', 'EmailNotifications'], () => {
  describe('[API] RP-5568 - Email Notifications | Verify delivery confirmation, partial dispatch, customer return-refund and partial OOS email notifications with split payments', () => {
    before(() => {
      cy.clearCookies({ domain: null })
      cy.clearLocalStorage({ domain: null })
    })

    after(() => {
        // Make sure we add back some points so that the account has some money
        cy.addRewardPoints(rewardsDetails.partnerId, rewardsDetails.siteId, rewardsDetails.posId, rewardsDetails.loyaltySiteType, rewardsCardNumber, 10000)
  
        // Reset Redeem to 0. If the test fails inbetween and the reward dollars was set,
        // future order placements and payments from the account will keep on failing with an error from RPG.
        // Resetting to 0 will avoid this
        cy.redeemRewardsDollars(0)
      })

    it('[API] RP-5568 - Email Notifications | Verify delivery confirmation, partial dispatch, customer return-refund and partial OOS email notifications with split payments', () => {
      // Login and place the order from testdata
      // Verify the projection and events
      // Verify the order confirmation email
      cy.loginAndPlaceRequiredOrderFromTestdata(shopper, testData).then((response) => {
        orderId = response.Order.OrderId.toString()
        orderReference = response.Order.OrderReference.toString()
        testData.orderId = orderId
        testData.orderReference = orderReference
        cy.log('This is the order id: ' + response.Order.OrderId + ', Order ref: ' + response.Order.OrderReference)

        // Verify the order totals are as expected
        lib.verifyOrderTotals(testData, response)

        // Invoke the order api and verify the projection content
        cy.ordersApiByShopperIdAndTraderOrderIdWithRetry(shopperId, orderId, {
          function: function (response) {
            if (response.body.invoices[0].wowStatus !== 'Placed') {
              cy.log('wowStatus was ' + response.body.invoices[0].wowStatus + ' instead of Placed')
              throw new Error('wowStatus was ' + response.body.invoices[0].wowStatus + ' instead of Placed')
            }
          },
          retries: Cypress.env('marketApiRetryCount'),
          timeout: Cypress.env('marketApiTimeout')
        }).as('orderPlacedProjection').then((response) => {
          edmOrderId = response.invoices[0].legacyIdFormatted
          edmInvoiceId = response.invoices[0].legacyId
          lineItemLegacyId = response.invoices[0].lineItems[0].legacyId
          encodedEdmInvoiceId = response.invoices[0].invoiceId
          encodedEdmLineitemId = response.invoices[0].lineItems[0].lineItemId
          testData.edmOrderId = edmOrderId
          testData.edmInvoiceId = edmInvoiceId
          testData.encodedEdmInvoiceId = encodedEdmInvoiceId
          testData.encodedEdmLineitemId = encodedEdmLineitemId
          cy.log('This is the MPOrder Id: ' + edmOrderId + ', MPInvoice Id: ' + edmInvoiceId)

          // Invoke the events api and verify the content
          cy.orderEventsApiWithRetry(orderReference, {
            function: function (response) {
              if (!response.body.data.some((element) => element.domainEvent === 'OrderPlaced') ||
                                !response.body.data.some((element) => element.domainEvent === 'MarketOrderPlaced')) {
                cy.log('Expected OrderPlaced & MarketOrderPlaced were not present')
                throw new Error('Expected OrderPlaced & MarketOrderPlaced were not present')
              }
            },
            retries: Cypress.env('marketApiRetryCount'),
            timeout: Cypress.env('marketApiTimeout')
          }).as('orderPlacedEvents')
        })
      })

      // Verify the order confirmation email
      cy.verifyDeliveryConfirmationEmailDetails(testData).then((deliveryConfirmationEmail) => {
        // Dispatch 2 quantity
        // Verify the projection and events
        // Verify the delivery confirmation email
        const trackingId1 = lib.generateRandomString()
        const data1 = [{ line_item_id: lineItemLegacyId, quantity: 2 }]
        cy.partialDispatchOfLineItemsInInvoice(testData.edmInvoiceId, data1, trackingId1, testData.carrier, testData.items[0].sellerName).then((response) => {
          const partialDispatchNumber = 1
          expect(response.data.attributes.shipment_tracking_number).to.be.equal(trackingId1)
          expect(response.data.attributes.shipment_carrier).to.be.equal(testData.carrier)
          expect(Number(response.data.relationships.invoice.id)).to.be.equal(testData.edmInvoiceId)
          expect(Number(response.data.relationships.line_items[0].id)).to.be.equal(lineItemLegacyId)
          expect(Number(response.included[0].id)).to.be.equal(lineItemLegacyId)
          expect(Number(response.included[0].attributes.invoice_id)).to.be.equal(testData.edmInvoiceId)
          expect(Number(response.included[1].attributes.line_item_id)).to.be.equal(lineItemLegacyId)

          cy.ordersApiByShopperIdAndTraderOrderIdWithRetry(shopperId, orderId, {
            function: function (response) {
              if (response.body.invoices[0].wowStatus !== 'PartiallyShipped') {
                cy.log('wowStatus was ' + response.body.invoices[0].wowStatus + ' instead of PartiallyShipped')
                throw new Error('wowStatus was ' + response.body.invoices[0].wowStatus + ' instead of PartiallyShipped')
              }
            },
            retries: Cypress.env('marketApiRetryCount'),
            timeout: Cypress.env('marketApiTimeout')
          }).as('partialDispatchProjection')

          cy.orderEventsApiWithRetry(orderReference, {
            function: function (response) {
              if (!response.body.data.some((element) => element.domainEvent === 'MarketOrderShipmentCreate') ||
                                !response.body.data.some((element) => element.domainEvent === 'MarketOrderDispatched') ||
                                !response.body.data.some((element) => element.domainEvent === 'MarketRewardsCredited')) {
                cy.log('Expected MarketOrderShipmentCreate, MarketOrderDispatched & MarketRewardsCredited were not present')
                throw new Error('Expected MarketOrderShipmentCreate, MarketOrderDispatched & MarketRewardsCredited were not present')
              }
            },
            retries: Cypress.env('marketApiRetryCount'),
            timeout: Cypress.env('marketApiTimeout')
          }).as('partialDispatchEvents')
        })

        //Commenting this as this email notification is currently toggled off
        // Verify the delivery confirmation email
        //cy.verifyOrderOnItsWayEmailDetails(testData).then((orderOnItsWayEmailVerification) => {
          // Initiate customer return for one quantity
          // Verify the projection and events
          // Verify the customer return confirmation email
          const returnRequestLineItem = [{ stockCode: testData.items[0].stockCode, quantity: 1, amount: testData.items[0].pricePerItem, reason: 'Item is faulty', weight: 12, notes: 'Customer Return from EM Test Automation_Full_Return' }]
          cy.log(returnRequestLineItem)
          cy.customerReturn(testData.edmOrderId, testData.orderReference, returnRequestLineItem).then((response) => {
            // Verify Order Projection details
            cy.ordersApiByShopperIdAndTraderOrderIdWithRetry(shopperId, orderId, {
              function: function (response) {
                if (response.body.invoices[0].refunds[0].status !== 'ReturnInitiated') {
                  cy.log('status was ' + response.body.invoices[0].refunds[0].status + ' instead of Return Initiated')
                  throw new Error('status was ' + response.body.invoices[0].refunds[0].status + ' instead of Return Initiated')
                }
              },
              retries: Cypress.env('marketApiRetryCount'),
              timeout: Cypress.env('marketApiTimeout')
            }).as('customerReturnProjection').then((response) => {
              const encodedMarketRefundedId = response.invoices[0].returns[0].marketRefundId
              cy.refundRequestReturn(encodedMarketRefundedId).then((response) => {
                expect(response.data.refundRequestReturn.refundRequest.status).to.be.equal('RETURNED')
              })
              cy.ordersApiByShopperIdAndTraderOrderIdWithRetry(shopperId, orderId, {
                function: function (response) {
                  if (response.body.invoices[0].invoiceStatus !== 'REFUNDED') {
                    cy.log('invoiceStatus was ' + response.body.invoices[0].invoiceStatus + ' instead of REFUNDED')
                    throw new Error('invoiceStatus was ' + response.body.invoices[0].invoiceStatus + ' instead of REFUNDED')
                  }
                },
                retries: Cypress.env('marketApiRetryCount'),
                timeout: Cypress.env('marketApiTimeout')
              }).as('customerReturnEvents')
            })
          })

          // Verify the customer return confirmation email
          cy.wait(5000)
          cy.verifyCustomerReturnAndRefundEmailDetails(testData).then((customerReturnAndRefundEmailVerification) => {
            // OOS one quatity
            // Verify the projection and events
            // Verify the OOS and refund confirmation email
            cy.cancelLineItemInInvoice(encodedEdmInvoiceId, encodedEdmLineitemId, 1, false).then((response) => {
              // After Seller cancellation, Invoke the order api and verify the projection content is updated acordingly for refunds
              cy.ordersApiByShopperIdAndTraderOrderIdWithRetry(shopperId, orderId, {
                function: function (response) {
                  if (response.body.invoices[0].wowStatus !== 'SellerCancelled' && response.body.invoices[0].invoiceStatus !== 'REFUNDED') {
                    cy.log('wowStatus was ' + response.body.invoices[0].wowStatus + ' instead of SellerCancelled, invoiceStatus was ' + response.body.invoices[0].invoiceStatus + ' instead of REFUNDED')
                    throw new Error('wowStatus was ' + response.body.invoices[0].wowStatus + ' instead of SellerCancelled, invoiceStatus was ' + response.body.invoices[0].invoiceStatus + ' instead of REFUNDED')
                  }
                },
                retries: Cypress.env('marketApiRetryCount'),
                timeout: Cypress.env('marketApiTimeout')
              }).as('oosProjection')

              // After seller cancellation, Invoke the events api and verify the events are updated acordingly
              cy.orderEventsApiWithRetry(orderReference, {
                function: function (response) {
                  if (!response.body.data.some((element) => element.domainEvent === 'RefundRequestUpdate') ||
                                        !response.body.data.some((element) => element.domainEvent === 'MarketOrderRefund') ||
                                        !response.body.data.some((element) => element.domainEvent === 'RefundCompleted')) {
                    cy.log('Expected RefundRequestUpdate, MarketOrderRefund & RefundCompleted were not present')
                    throw new Error('Expected RefundRequestUpdate, MarketOrderRefund & RefundCompleted were not present')
                  }
                },
                retries: Cypress.env('marketApiRetryCount'),
                timeout: Cypress.env('marketApiTimeout')
              }).as('oosEvents')
            })

            // Verify the OOS and refund confirmation email
            cy.wait(5000)
            cy.verifyOOSEmailDetails(testData)
          })
        //})
      })
    })
  })
})

Cypress.Commands.add('verifyDeliveryConfirmationEmailDetails', (testData) => {
  cy.get('@orderPlacedProjection').then((orderPlacedProjection) => {
    cy.get('@orderPlacedEvents').then((orderPlacedEvents) => {
      cy.getOrderStatus(testData.orderId).as('orderPlacedOqsResponse').then((orderPlacedOqsResponse) => {
        const expectedSubject = 'Delivery order #' + orderId + ' - Confirmation'
        cy.getEmailDetails(emailId, expectedSubject, sentFrom)
        cy.get('@emailDetails').then((emailDetails) => {
          const body = emailDetails.body.toLowerCase()
          expect(emailDetails.subject).to.be.equal(expectedSubject)
          // Verify common details
          expect(body).to.include(orderId)
          expect(body).to.include(orderPlacedOqsResponse.MarketDeliveryStreet1.toLowerCase())
          expect(body).to.include(orderPlacedOqsResponse.MarketDeliveryStreet2.toLowerCase())
          expect(body).to.include(orderPlacedOqsResponse.MarketDeliverySuburb.toLowerCase())
          expect(body).to.include(orderPlacedOqsResponse.MarketDeliveryPostCode.toLowerCase())
          expect(body).to.include(orderPlacedOqsResponse.DeliveryStreet1.toLowerCase())
          // expect(body).to.include(orderPlacedOqsResponse.DeliveryStreet2.toLowerCase()) for some reason the state is not shown in the email "SURRY HILLS NSW"
          expect(body).to.include(orderPlacedOqsResponse.DeliverySuburb.toLowerCase())
          expect(body).to.include(orderPlacedOqsResponse.DeliveryPostCode.toLowerCase())
          // expect(body).to.include(orderPlacedOqsResponse.Total) not appearing in email
          expect(body).to.include(orderPlacedOqsResponse.Shopper.FirstName.toLowerCase())

          // Verify totals
          expect(body).to.include(Number(Number.parseFloat(Number(testData.wowTotal)).toFixed(2)))
          expect(body).to.include(Number(Number.parseFloat(Number(testData.edmTotal)).toFixed(2)))
          expect(body).to.include(Number(Number.parseFloat(Number(testData.orderTotal)).toFixed(2)))
          expect(body).to.include(Number(Number.parseFloat(Number(testData.edmDeliveryCharges)).toFixed(2)))
          expect(body).to.include(Number(Number.parseFloat(Number(testData.wowDeliveryCharges)).toFixed(2)))
          expect(body).to.include(Number(Number.parseFloat(Number(testData.packagingFee)).toFixed(2)))

          // Verify links
          expect(emailDetails.dom.window.document.querySelector("a[href*='/shop/myaccount/myorders']") !== null).to.be.true
          expect(emailDetails.dom.window.document.querySelector("a[href*='/shop/myaccount/myinvoices']") !== null).to.be.true
          expect(emailDetails.dom.window.document.querySelector("a[href*='/shop/myaccount/myorders/" + orderId + "']") !== null).to.be.true
          expect(emailDetails.dom.window.document.querySelector("a[href*='/shop/myaccount/trackmyorder?ordernumber=" + orderId + "']") !== null).to.be.true
          expect(emailDetails.dom.window.document.querySelector("a[href*='/shop/discover/shopping-online/delivery']") !== null).to.be.true
          expect(emailDetails.dom.window.document.querySelector("a[href*='/shop/page/about-us/terms-and-conditions']") !== null).to.be.true

          // Verify payment method
          expect(body).to.include('Paid with Everyday Rewards dollars'.toLowerCase())
          expect(body).to.include('Paid by Gift Card'.toLowerCase())
          expect(body).to.include('Paid by Credit Card'.toLowerCase())
          expect(body).to.include(Number(Number.parseFloat(Number(testData.orderTotal) - Number(20)).toFixed(2)))

          // Verify wow items
          let k
          const wowItems = orderPlacedOqsResponse.OrderProducts
          wowItems.forEach(function (item, k) {
            expect(body).to.include(orderPlacedOqsResponse.OrderProducts[k].Ordered.Name.toLowerCase())
            expect(body).to.include(orderPlacedOqsResponse.OrderProducts[k].Ordered.Quantity)
            expect(body).to.include(orderPlacedOqsResponse.OrderProducts[k].Ordered.Total)
            expect(body).to.include(orderPlacedOqsResponse.OrderProducts[k].Ordered.SalePrice.Value)
          })

          // Verify EDM items
          let i
          const edmItems = orderPlacedOqsResponse.MarketOrders
          edmItems.forEach(function (item, i) {
            expect(body).to.include(orderPlacedOqsResponse.MarketOrders[i].SellerName.toLowerCase())
            expect(body).to.include(orderPlacedOqsResponse.MarketOrders[i].Total)
            expect(body).to.include(orderPlacedOqsResponse.MarketOrders[i].MarketShippingFee)
            expect(body).to.include(orderPlacedOqsResponse.MarketOrders[i].MarketShippingFeeBeforeDiscount)
            expect(body).to.include(orderPlacedOqsResponse.MarketOrders[i].DeliveryInfo.DayRangeDispatchNote.toLowerCase())

            let j
            const products = orderPlacedOqsResponse.MarketOrders[i].Products
            products.forEach(function (product, j) {
              expect(body).to.include(orderPlacedOqsResponse.MarketOrders[i].Products[j].SellerName.toLowerCase())
              expect(body).to.include(orderPlacedOqsResponse.MarketOrders[i].Products[j].DeliveryFee)
              expect(body).to.include(orderPlacedOqsResponse.MarketOrders[i].Products[j].Name.toLowerCase())
              expect(body).to.include(orderPlacedOqsResponse.MarketOrders[i].Products[j].Quantity)
              expect(body).to.include(orderPlacedOqsResponse.MarketOrders[i].Products[j].Total)
              expect(body).to.include(orderPlacedOqsResponse.MarketOrders[i].Products[j].SalePrice)
            })
          })
        })
      })
    })
  })
})

Cypress.Commands.add('verifyOrderOnItsWayEmailDetails', (testData) => {
  cy.get('@partialDispatchProjection').then((partialDispatchProjection) => {
    cy.get('@partialDispatchEvents').then((partialDispatchEvents) => {
      cy.getOrderStatus(testData.orderId).as('partialDispatchOqsResponse').then((partialDispatchOqsResponse) => {
        const expectedSubject = 'Your Everyday Market order ' + edmOrderId + ' is on its way'
        cy.getEmailDetails(emailId, expectedSubject, sentFrom)
        cy.get('@emailDetails').then((emailDetails) => {
          const body = emailDetails.body.toLowerCase()
          expect(emailDetails.subject).to.be.equal(expectedSubject)
          // Verify common details
          expect(emailDetails.body).to.include(edmOrderId)
          expect(body).to.include(partialDispatchOqsResponse.Shopper.FirstName.toLowerCase())

          // Verify links
          expect(emailDetails.dom.window.document.querySelector("a[href*='/shop/page/help-and-support-faq']") !== null).to.be.true
          expect(emailDetails.dom.window.document.querySelector("a[href*='/Shop/Discover/about-us/terms-and-conditions']") !== null).to.be.true

          // Verify EDM items
          let i
          const edmItems = partialDispatchOqsResponse.MarketOrders
          edmItems.forEach(function (item, i) {
            expect(body).to.include(partialDispatchOqsResponse.MarketOrders[i].SellerName.toLowerCase())
            expect(body).to.include(partialDispatchOqsResponse.MarketOrders[i].Shipment.TrackingNumber.toLowerCase())
            expect(body).to.include('2') // Shipped quantity
            // expect(body).to.include('2 / 5') //Shipped quantity
            // Verify TrackingLink - https://auspost.com.au/mypost/track/#/details/oHQ4NTGPQF
            expect(emailDetails.dom.window.document.querySelector("a[href*='" + partialDispatchOqsResponse.MarketOrders[i].Shipment.TrackingLink + "']") !== null).to.be.true

            let j
            const products = partialDispatchOqsResponse.MarketOrders[i].Products
            products.forEach(function (product, j) {
              expect(body).to.include(partialDispatchOqsResponse.MarketOrders[i].Products[j].SellerName.toLowerCase())
              expect(body).to.include(partialDispatchOqsResponse.MarketOrders[i].Products[j].Name.toLowerCase())
            })
          })
        })
      })
    })
  })
})

Cypress.Commands.add('verifyCustomerReturnAndRefundEmailDetails', (testData) => {
  cy.get('@customerReturnProjection').then((customerReturnProjection) => {
    cy.get('@customerReturnEvents').then((customerReturnEvents) => {
      cy.getOrderStatus(testData.orderId).as('customerReturnOqsResponse').then((customerReturnOqsResponse) => {
        const expectedSubject = 'Everyday Market order ' + edmOrderId + ' return created'
        cy.getEmailDetails(emailId, expectedSubject, sentFrom)
        cy.get('@emailDetails').then((emailDetails) => {
          const body = emailDetails.body.toLowerCase()
          expect(emailDetails.subject).to.be.equal(expectedSubject)
          // Verify common details
          expect(emailDetails.body).to.include(edmOrderId)

          // Verify label download link and other links
          expect(emailDetails.dom.window.document.querySelector("a[href*='" + customerReturnOqsResponse.MarketOrders[0].Returns[0].Labels[0].Url + "']") !== null).to.be.true
          expect(emailDetails.dom.window.document.querySelector("a[href*='https://auspost.com.au/locate/']") !== null).to.be.true
          expect(emailDetails.dom.window.document.querySelector("a[href*='/Shop/Discover/about-us/terms-and-conditions']") !== null).to.be.true
          expect(emailDetails.dom.window.document.querySelector("a[href*='/shop/page/help-and-support-faq']") !== null).to.be.true

          // Verify EDM items
          let i
          const edmItems = customerReturnOqsResponse.MarketOrders
          edmItems.forEach(function (item, i) {
            let j
            const products = customerReturnOqsResponse.MarketOrders[i].Products
            products.forEach(function (product, j) {
              expect(body).to.include(customerReturnOqsResponse.MarketOrders[i].Products[j].Name.toLowerCase())
              expect(body).to.include('1 x ')
              expect(body).to.include(customerReturnOqsResponse.MarketOrders[i].Products[j].SalePrice)
            })
          })
        })
        const expectedSubject2 = 'Everyday Market Refund Notification - ' + edmOrderId
        cy.getEmailDetails(emailId, expectedSubject2, sentFrom)
        cy.get('@emailDetails').then((emailDetails) => {
          const body = emailDetails.body.toLowerCase()
          expect(emailDetails.subject).to.be.equal(expectedSubject2)
          // Verify common details
          expect(body).to.include(customerReturnOqsResponse.Shopper.FirstName.toLowerCase())

          // Verify links
          expect(emailDetails.dom.window.document.querySelector("a[href*='/shop/page/help-and-support-faq']") !== null).to.be.true
          expect(emailDetails.dom.window.document.querySelector("a[href*='Shop/Discover/about-us/terms-and-conditions']") !== null).to.be.true

          // Refund amount
          const refundText = 'Your credit/debit card used for payment will be refunded with the amount of $' + customerReturnOqsResponse.MarketOrders[0].Products[0].SalePrice + '. Your refund may take 3 to 5 business days depending on your financial institution’s processing time.'
          console.log('refundText: ' + refundText)
          expect(body).to.include(refundText.toLowerCase())

          // Verify EDM items
          let i
          const edmItems = customerReturnOqsResponse.MarketOrders
          edmItems.forEach(function (item, i) {
            let j
            const products = customerReturnOqsResponse.MarketOrders[i].Products
            products.forEach(function (product, j) {
              expect(body).to.include(customerReturnOqsResponse.MarketOrders[i].Products[j].Name.toLowerCase())
              expect(body).to.include('1 x ')
              expect(body).to.include(customerReturnOqsResponse.MarketOrders[i].Products[j].SalePrice)
            })
          })
        })
      })
    })
  })
})

Cypress.Commands.add('verifyOOSEmailDetails', (testData) => {
  cy.get('@oosProjection').then((oosProjection) => {
    cy.get('@oosEvents').then((oosEvents) => {
      cy.getOrderStatus(testData.orderId).as('oosOqsResponse').then((oosOqsResponse) => {
        // let expectedSubject = 'Everyday Market Out of Stock Notification ' + edmOrderId
        const expectedSubject = 'Everyday Market items removed from order ' + edmOrderId
        cy.getEmailDetails(emailId, expectedSubject, sentFrom)
        cy.get('@emailDetails').then((emailDetails) => {
          const body = emailDetails.body.toLowerCase()
          expect(emailDetails.subject).to.be.equal(expectedSubject)
          // Verify common details
          expect(emailDetails.body).to.include(edmOrderId)
          expect(emailDetails.body).to.include(orderId)
          expect(body).to.include(oosOqsResponse.Shopper.FirstName.toLowerCase())

          // Refund amount
          const oosRefundText = 'Your credit/debit card used for payment will be refunded with the amount of $' + oosOqsResponse.MarketOrders[0].Products[0].SalePrice + '. Your refund may take 3 to 5 business days depending on your financial institution’s processing time.'
          console.log('oosRefundText: ' + oosRefundText)
          expect(body).to.include(oosRefundText.toLowerCase())

          // Verify links
          expect(emailDetails.dom.window.document.querySelector("a[href*='/shop/page/help-and-support-faq']") !== null).to.be.true
          expect(emailDetails.dom.window.document.querySelector("a[href*='Shop/Discover/about-us/terms-and-conditions']") !== null).to.be.true

          // Verify EDM items
          let i
          const edmItems = oosOqsResponse.MarketOrders
          edmItems.forEach(function (item, i) {
            let j
            const products = oosOqsResponse.MarketOrders[i].Products
            products.forEach(function (product, j) {
              expect(body).to.include(oosOqsResponse.MarketOrders[i].Products[j].Name.toLowerCase())
              expect(body).to.include('1')
              expect(body).to.include(oosOqsResponse.MarketOrders[i].Products[j].SalePrice)
            })
          })
        })
      })
    })
  })
})
