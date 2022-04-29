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

const { JSDOM } = require('jsdom')
const testData: any = tests.VerifyEmailNotificationsEDMOnly
let orderId: any
let orderReference: any
let edmOrderId: any
let edmInvoiceId: any
const shopper: any = shoppers.emailTest3
const shopperId: any = shopper.shopperId
const emailId: any = shopper.email
let lineItemLegacyId: any
let encodedEdmInvoiceId: any
let encodedEdmLineitemId: any
const sentFrom: string = 'shoponline@woolworths.com.au'

TestFilter(['EDM', 'API', 'EDM-E2E-API', 'EmailNotifications'], () => {
  describe('[API] RP-5571 - Email Notifications | Verify Market full OOS Refund email notification with split payments', () => {
    before(() => {
      cy.clearCookies({ domain: null })
      cy.clearLocalStorage({ domain: null })
    })

    it('[API] RP-5571 - Email Notifications | Verify Market full OOS Refund email notification with split payments', () => {
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
        // Full OOS
        // Verify the projection and events
        // Verify the OOS and refund confirmation email
        cy.cancelLineItemInInvoice(encodedEdmInvoiceId, encodedEdmLineitemId, testData.items[0].quantity, false).then((response) => {
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
          // Verify the OOS and refund confirmation email
          cy.wait(5000)
          cy.verifyOOSEmailDetails(testData)
        })
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
          expect(body).to.include(orderPlacedOqsResponse.MarketDeliveryStreet1.toLowerCase())
          expect(body).to.include(orderPlacedOqsResponse.MarketDeliveryStreet2.toLowerCase())
          expect(body).to.include(orderPlacedOqsResponse.MarketDeliverySuburb.toLowerCase())
          expect(body).to.include(orderPlacedOqsResponse.MarketDeliveryPostCode.toLowerCase())
          expect(body).to.include(orderPlacedOqsResponse.Shopper.FirstName.toLowerCase())

          // Verify totals
          expect(body).to.include(Number(Number.parseFloat(Number(testData.edmTotal)).toFixed(2)))
          expect(body).to.include(Number(Number.parseFloat(Number(testData.orderTotal)).toFixed(2)))
          expect(body).to.include(Number(Number.parseFloat(Number(testData.edmDeliveryCharges)).toFixed(2)))

          // Verify links
          expect(emailDetails.dom.window.document.querySelector("a[href*='/shop/myaccount/myorders']") !== null).to.be.true
          expect(emailDetails.dom.window.document.querySelector("a[href*='/shop/myaccount/myinvoices']") !== null).to.be.true
          expect(emailDetails.dom.window.document.querySelector("a[href*='/shop/discover/shopping-online/delivery']") !== null).to.be.true
          expect(emailDetails.dom.window.document.querySelector("a[href*='/shop/page/about-us/terms-and-conditions']") !== null).to.be.true

          // Verify payment method
          expect(body).to.include('Paid with Everyday Rewards dollars'.toLowerCase())
          expect(body).to.include('10.00')
          expect(body).to.include('Paid by Gift Card'.toLowerCase())
          expect(body).to.include('10.00')
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

Cypress.Commands.add('verifyOOSEmailDetails', (testData) => {
  cy.get('@oosProjection').then((oosProjection) => {
    cy.get('@oosEvents').then((oosEvents) => {
      cy.getOrderStatus(testData.orderId).as('oosOqsResponse').then((oosOqsResponse) => {
        // let expectedSubject = 'Everyday Market Out of Stock Notification ' + edmOrderId
        const expectedSubject = 'Everyday Market order ' + edmOrderId + ' has been cancelled'
        cy.getEmailDetails(emailId, expectedSubject, sentFrom)
        cy.get('@emailDetails').then((emailDetails) => {
          const body = emailDetails.body.toLowerCase()
          expect(emailDetails.subject).to.be.equal(expectedSubject)
          // Verify common details
          expect(emailDetails.body).to.include(edmOrderId)
          expect(body).to.include(oosOqsResponse.Shopper.FirstName.toLowerCase())
          expect(emailDetails.body).to.include('Sorry your order has been cancelled')
          expect(emailDetails.body).to.include('Shipping Fee')
          expect(emailDetails.body).to.include('We’re sorry for any inconvenience caused. Thank you for understanding.')
          expect(emailDetails.body).to.include('Your Everyday Market team')

          // Coupon code details
          expect(emailDetails.body).to.include('Coupon Code:')
          expect(emailDetails.body).to.include('Expiry Date:')
          expect(emailDetails.body).to.include('Amount:')
          expect(emailDetails.body).to.include('$20.00')

          // Refund amount
          const oosRefundText = 'Your credit/debit card used for payment will be refunded with the amount of $' + (Number(Number.parseFloat(Number(testData.orderTotal) - Number(20)).toFixed(2))) + '. Your refund may take 3 to 5 business days depending on your financial institution’s processing time.'
          console.log('oosRefundText: ' + oosRefundText)
          expect(emailDetails.body).to.include(oosRefundText)
          const oosRefundText2 = 'A store credit of $20.00 has been added to your account. Please enter the below coupon code(s) at checkout to redeem, the next time you shop with Woolworths Online and Everyday Market from Woolworths. Minimum spend of $30 applies.'
          console.log('oosRefundText2: ' + oosRefundText2)
          expect(emailDetails.body).to.include(oosRefundText2)

          // Refund quantity
          expect(emailDetails.body).to.include(Number(testData.items[0].quantity))
          expect(emailDetails.body).to.include(Number(1)) // Shipping fee

          // Verify links
          expect(emailDetails.dom.window.document.querySelector("a[href*='/shop/page/help-and-support-faq']") !== null).to.be.true
          expect(emailDetails.dom.window.document.querySelector("a[href*='/Shop/Discover/about-us/terms-and-conditions']") !== null).to.be.true

          // Verify EDM items
          let i
          const edmItems = oosOqsResponse.MarketOrders
          edmItems.forEach(function (item, i) {
            let j
            const products = oosOqsResponse.MarketOrders[i].Products
            products.forEach(function (product, j) {
              expect(body).to.include(oosOqsResponse.MarketOrders[i].Products[j].Name.toLowerCase())
              expect(body).to.include(Number(oosOqsResponse.MarketOrders[i].Products[j].Quantity))
            })
          })
        })
      })
    })
  })
})
