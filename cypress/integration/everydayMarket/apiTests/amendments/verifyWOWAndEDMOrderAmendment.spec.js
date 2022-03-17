/// <reference types="cypress" />
/* eslint-disable no-unused-expressions */

import eventsRequest from '../../../../fixtures/everydayMarket/events.json'
import TestFilter from '../../../../support/TestFilter'
import '../../../../support/login/api/commands/login'
import '../../../../support/everydayMarket/api/commands/orderApi'
import '../../../../support/everydayMarket/api/commands/marketplacer'
import '../../../../support/everydayMarket/api/commands/orderPlacementHelpers'
import '../../../../support/rewards/api/commands/rewards'
import '../../../../support/refunds/api/commands/commands'
import '../../../../support/orders/api/commands/amendOrder'
import search from '../../../../fixtures/everydayMarket/search.json'
import * as lib from '../../../../support/everydayMarket/api/commands/validationHelpers'
import * as commonLib from '../../../../support/everydayMarket/api/commands/commonHelpers'

TestFilter(['EDM', 'API', 'EDM-E2E-API'], () => {
  describe('[API] RP-5031 - EM | Amend grocery order and verify Everyday Market order remains unchanged', () => {
    before(() => {
      cy.clearCookies({ domain: null })
      cy.clearLocalStorage({ domain: null })
    })

    after(() => {
      cy.clearAnyOrderAmendments()
    })

    it('[API] RP-5031 - EM | Amend grocery order and verify Everyday Market order remains unchanged', () => {
      const purchaseQty = 2
      let shopperId
      let req

      // Sign up for a new shopper
      cy.loginWithNewShopperViaApi()

      cy.get('@signUpResponse').then((signUpResp) => {
        shopperId = signUpResp.ShopperId
      })

      // Place single line item EDM order with quantity = 2, using 'treats' as search term
      // and grab the first any available EDM item returned by search
      cy.prepareAnySingleLineItemWowAndEdmOrder(search.searchTerm, purchaseQty)
      cy.placeOrderUsingCreditCard().as('confirmedTraderOrder')

      cy.get('@confirmedTraderOrder').then((confirmedOrder) => {
        req = {
          ...eventsRequest,
          shopperId: shopperId,
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
            if (response.body.invoices[0].orderTrackingStatus !== 'Received') {
              cy.log('Expected orderTrackingStatus to be "Received"')
              throw new Error('Expected orderTrackingStatus to be "Received"')
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
                cy.log('Order ID has not been updated with the latest order amendment ID')
                throw new Error('Order ID has not been updated with the latest order amendment ID')
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
          }).excludingEvery(['status', 'updatedTimeStampUtc', 'createdTimeStampUtc']).to.deep.equal(afterData)

          // Validate EDM order events after amendment to have 'OrderPlaced' event
          lib.validateEvents(afterEvents, 'OrderPlaced', 2)

          // Invoke OQS TMO api and validate it against the projection
          // New trader order will be in Received state, Will be an WOW + MP Order and will have all the WOW items in it. Passing testdata as null as this test does not use testdata. So skipping wow items verifications.
          commonLib.verifyOQSOrderStatus(afterData.orderId, 'Received', false, null, false)
        })
      })
    })
  })
})
