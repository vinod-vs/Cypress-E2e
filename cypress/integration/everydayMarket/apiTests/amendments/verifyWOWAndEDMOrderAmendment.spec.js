/// <reference types="cypress" />
/* eslint-disable no-unused-expressions */

import shoppers from '../../../../fixtures/everydayMarket/shoppers.json'
import eventsRequest from '../../../../fixtures/everydayMarket/events.json'
import TestFilter from '../../../../support/TestFilter'
import '../../../../support/login/api/commands/login'
import '../../../../support/everydayMarket/api/commands/orderApi'
import '../../../../support/everydayMarket/api/commands/marketplacer'
import '../../../../support/everydayMarket/api/commands/orderPlacementHelpers'
import '../../../../support/rewards/api/commands/rewards'
import '../../../../support/refunds/api/commands/commands'
import '../../../../support/orders/api/commands/amendOrder'
import * as lib from '../../../../support/everydayMarket/api/commands/validationHelpers'
import * as commonLib from '../../../../support/everydayMarket/api/commands/commonHelpers'

TestFilter(['EDM', 'API'], () => {
  describe('[API] RP-5031 - EM | Amend grocery order and verify Everyday Market order remains unchanged', () => {
    before(() => {
      cy.clearCookies({ domain: null })
      cy.clearLocalStorage({ domain: null })
    })

    after(() => {
      cy.clearAnyOrderAmendments()
    })

    it('[API] RP-5031 - EM | Amend grocery order and verify Everyday Market order remains unchanged', () => {
      const shopper = shoppers.emAccount2
      const searchTerm = 'automation'
      const purchaseQty = 2
      let req

      // Login using shopper saved in the fixture
      cy.loginViaApiAndHandle2FA(shopper)

      // Place single line item EDM order with quantity = 2, using 'treats' as search term
      // and grab the first any available EDM item returned by search
      cy.prepareAnySingleLineItemWowAndEdmOrder(searchTerm, purchaseQty)
      cy.placeOrderUsingCreditCard().as('confirmedTraderOrder')

      cy.get('@confirmedTraderOrder').then((confirmedOrder) => {
        req = {
          ...eventsRequest,
          shopperId: shopper.shopperId,
          orderId: confirmedOrder.Order.OrderId,
          orderReference: confirmedOrder.Order.OrderReference
        }

        cy.orderEventsApiWithRetry(req.orderReference, {
          function: function (response) {
            if (!response.body.data.some((element) => element.domainEvent === 'OrderPlaced') ||
                            !response.body.data.some((element) => element.domainEvent === 'MarketOrderPlaced')) {
              cy.log('Expected OrderPlaced & MarketOrderPlaced to be present')
              throw new Error('Expected OrderPlaced & MarketOrderPlaced to be present')
            }
          },
          retries: Cypress.env('marketApiRetryCount'),
          timeout: 10000
        })

        // Call Market Order API and validate the data
        cy.ordersApiByShopperIdAndTraderOrderIdWithRetry(req.shopperId, req.orderId, {
          function: function (response) {
            if (response.body.invoices[0].lineItems[0].status !== 'ALLOCATED') {
              throw new Error('Still not sent to Marketplacer yet')
            }
          },
          retries: Cypress.env('marketApiRetryCount'),
          timeout: Cypress.env('marketApiTimeout')
        }).its('invoices').its(0).its('legacyIdFormatted').as('invoiceIds')

        cy.get('@invoiceIds').then((invoiceIds) => {
          cy.ordersApiByEdmInvoiceIdWithRetry(invoiceIds, {
            function: function (response) {
              if (response.status !== 200) {
                throw new Error('Still wrong status')
              }
            },
            retries: Cypress.env('marketApiRetryCount'),
            timeout: Cypress.env('marketApiTimeout')
          }).as('orderDataBeforeAmendment')
        })

        // Amend the WOW part of the order
        cy.completeOrderAmendment(req.orderId).as('confirmedAmendedTraderOrder').then(() => {
          // Call the Market Events API and save the events data in an alias
          cy.orderEventsApiWithRetry(req.orderReference, {
            function: function (response) {
              if (response.body.data.filter(element => element.domainEvent === 'OrderPlaced').length != 2) {
                cy.log('Expected OrderPlaced events count to be two')
                throw new Error('Expected OrderPlaced events count to be two')
              }
            },
            retries: Cypress.env('marketApiRetryCount'),
            timeout: 10000
          }).as('eventsAfterAmendment')
        })

        cy.all(
          cy.get('@invoiceIds'),
          cy.get('@confirmedAmendedTraderOrder')
        ).then(([invoiceIds, amendedOrder]) => {
          cy.ordersApiByEdmInvoiceIdWithRetry(invoiceIds, {
            function: function (response) {
              if (response.body[0].orderId !== amendedOrder.Order.OrderId) {
                throw new Error('Data not updated yet')
              }
            },
            retries: Cypress.env('marketApiRetryCount'),
            timeout: Cypress.env('marketApiTimeout')
          }).as('orderDataAfterAmendment')
        })

        cy.get('@orderDataAfterAmendment').as('finalProjection')

        cy.all(
          cy.get('@confirmedAmendedTraderOrder'),
          cy.get('@orderDataBeforeAmendment'),
          cy.get('@orderDataAfterAmendment'),
          cy.get('@eventsAfterAmendment')
        ).then(([amendedOrder, beforeData, afterData, afterEvents]) => {
          // Validate EDM order data only has update on order ID and the rest of the data remain the same before and after amendment
          expect({
            ...beforeData,
            orderId: amendedOrder.Order.OrderId
          }).to.deep.equal(afterData)

          // Validate EDM order events after amendment to have 'OrderPlaced' event
          lib.validateEvents(afterEvents, 'OrderPlaced', 2)

          // Invoke OQS TMO api and validate it against the projection
          // Old trader order will be in Cancelled state, Will be an WOW + MP Order and will have all the WOW items as well. Passing testdata as null as this test does not use testdata. So skipping wow items verifications.
          commonLib.verifyOQSOrderStatus(beforeData.orderId, 'Cancelled', false, null, true)
          // New trader order will be in Received state, Will be an WOW + MP Order and will have all the WOW items in it. Passing testdata as null as this test does not use testdata. So skipping wow items verifications.
          commonLib.verifyOQSOrderStatus(afterData.orderId, 'Received', false, null, false)
        })
      })
    })
  })
})
