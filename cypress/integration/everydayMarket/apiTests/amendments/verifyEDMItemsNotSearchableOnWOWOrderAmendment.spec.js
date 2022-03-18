/// <reference types="cypress" />
/* eslint-disable no-unused-expressions */

import shoppers from '../../../../fixtures/everydayMarket/shoppers.json'
import TestFilter from '../../../../support/TestFilter'
import '../../../../support/login/api/commands/login'
import '../../../../support/search/api/commands/search'
import '../../../../support/fulfilment/api/commands/fulfilment'
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
import '../../../../support/orders/api/commands/amendOrder'
import tests from '../../../../fixtures/everydayMarket/apiTests.json'
import * as lib from '../../../../support/everydayMarket/api/commands/commonHelpers'
import searchRequest from '../../../../fixtures/search/productSearch.json'

TestFilter(['EDM', 'API', 'EDM-E2E-API'], () => {
  describe('[API] RP-5152 - EM | Amend grocery order and verify Everyday Market products are not searchable and addable to cart', () => {
    before(() => {
      cy.clearCookies({ domain: null })
      cy.clearLocalStorage({ domain: null })
    })

    after(() => {
      cy.clearAnyOrderAmendments()
    })

    it('[API] RP-5152 - EM | Amend grocery order and verify Everyday Market products are not searchable and addable to cart', () => {
      const shopper = shoppers.emAccountWithRewards1
      const shopperId = shoppers.emAccountWithRewards1.shopperId
      const testData = tests.GenericWOWPlusEDMPPPaymentTestData
      let orderId
      let orderReference
      let edmOrderId
      let edmInvoiceId

      // Login and place the order from testdata
      cy.loginAndPlaceRequiredOrderFromTestdata(shopper, testData).as('placedOrderResponse')

      // Verify order totals
      cy.get('@placedOrderResponse').then((placedOrderResponse) => {
        orderId = placedOrderResponse.Order.OrderId.toString()
        orderReference = placedOrderResponse.Order.OrderReference.toString()
        testData.orderId = orderId
        testData.orderReference = orderReference
        cy.log('This is the order id: ' + placedOrderResponse.Order.OrderId + ', Order ref: ' + placedOrderResponse.Order.OrderReference)

        // Verify the order totals are as expected
        lib.verifyOrderTotals(testData, placedOrderResponse)

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
        }).as('finalProjection').then((response) => {
          edmOrderId = response.invoices[0].legacyIdFormatted
          edmInvoiceId = response.invoices[0].legacyId
          testData.edmOrderId = edmOrderId
          testData.edmInvoiceId = edmInvoiceId
          cy.log('This is the MPOrder Id: ' + edmOrderId + ', MPInvoice Id: ' + edmInvoiceId)
          // Verify the projection details
          lib.verifyInitialOrderDetails(response, testData, shopperId)
        })

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
        }).then((response) => {
          lib.verifyEventDetails(response, 'OrderPlaced', testData, shopperId, 1)
          lib.verifyEventDetails(response, 'MarketOrderPlaced', testData, shopperId, 1)
        })

        // Amend the above created WOW order
        cy.amendOrder(orderId)

        // Verify the order is open for amendment
        cy.getCurrentlyAmendingOrder().then((currentlyAmendingOrder) => {
          expect(currentlyAmendingOrder.OrderId).to.be.equal(Number(orderId))
        })

        // Verify the product search results
        searchRequest.SearchTerm = testData.searchTerm
        cy.productSearch(searchRequest).as('searchProductsResponse')
        cy.get('@searchProductsResponse').then((response) => {
          expect(response.SearchResultsCount).to.be.greaterThan(0)

          // Verify no EDM products are available for user to ATC
          const edmSearchProduct = response.Products.filter(searchProduct => searchProduct.Products[0].IsMarketProduct && searchProduct.Products[0].IsAvailable && searchProduct.Products[0].IsPurchasable && searchProduct.Products[0].Price !== null)
          cy.log('Product EDM Search' + JSON.stringify(edmSearchProduct))
          expect(edmSearchProduct).to.be.empty

          // Verify WOW itmes are still searchable and addable to cart
          const wowSearchProduct = response.Products.filter(searchProduct => !searchProduct.Products[0].IsMarketProduct && searchProduct.Products[0].IsAvailable && searchProduct.Products[0].IsPurchasable && searchProduct.Products[0].Price !== null)
          cy.log('Product WOW Search' + JSON.stringify(wowSearchProduct))
          expect(wowSearchProduct.length).to.be.greaterThan(0)
        })

        // Invoke OQS TMO api and validate it against the projection
        lib.verifyOQSOrderStatus(testData.orderId, 'Received', false, testData)
      })
    })
  })
})
