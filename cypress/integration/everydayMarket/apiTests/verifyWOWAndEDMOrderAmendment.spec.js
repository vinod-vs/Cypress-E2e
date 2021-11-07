/// <reference types="cypress" />
/* eslint-disable no-unused-expressions */

import eventsRequest from '../../../fixtures/everydayMarket/events.json'
import search from '../../../fixtures/everydayMarket/search.json'
import TestFilter from '../../../support/TestFilter'
import '../../../support/login/api/commands/login'
import '../../../support/everydayMarket/api/commands/orderApi'
import '../../../support/everydayMarket/api/commands/marketplacer'
import '../../../support/everydayMarket/api/commands/orderPlacementHelpers'
import '../../../support/rewards/api/commands/rewards'
import '../../../support/refunds/api/commands/commands'
import '../../../support/orders/api/commands/amendOrder'
import * as lib from '../../../support/everydayMarket/api/commands/validationHelpers'
import * as commonLib from '../../../support/everydayMarket/api/commands/commonHelpers'

TestFilter(['EDM-API'], () => {
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
      let req

      // Login using a newly signed up shopper
      cy.loginWithNewShopperViaApi()

      // Place single line item EDM order with quantity = 2, using 'treats' as search term
      // and grab the first any available EDM item returned by search
      cy.prepareAnySingleLineItemWowAndEdmOrder(search.searchTerm, purchaseQty)
      cy.placeOrderUsingCreditCard().as('confirmedTraderOrder')

      cy.all(
        cy.get('@confirmedTraderOrder'),
        cy.get('@shopperId')
      ).then(([confirmedOrder, shopperId]) => {
        req = {
          ...eventsRequest,
          shopperId: shopperId,
          orderId: confirmedOrder.Order.OrderId,
          orderReference: confirmedOrder.Order.OrderReference
        }

        // Call Market Order API and validate the data
        cy.ordersApiByShopperIdAndTraderOrderIdWithRetry(req.shopperId, req.orderId, {
          function: function (response) {
            if (response.body.invoices[0].wowStatus !== 'Placed') {
              throw new Error('Still not sent to Marketplacer yet')
            }
          },
          retries: Cypress.env('marketApiRetryCount'),
          timeout: Cypress.env('marketApiTimeout')
        }).its('invoices').its(0).its('legacyIdFormatted').as('invoiceIds')

        cy.orderEventsApiWithRetry(req.orderReference, {
          function: function (response) {
            if (response.body.pagination.total !== 3) {
              throw new Error('Event not updated yet')
            }
          },
          retries: Cypress.env('marketApiRetryCount'),
          timeout: Cypress.env('marketApiTimeout')
        })

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

          // Call the Market Events API and save the events data in an alias
          cy.orderEventsApiWithRetry(req.orderReference, {
            function: function (response) {
              if (response.body.pagination.total !== 4) {
                throw new Error('Event not updated yet')
              }
            },
            retries: Cypress.env('marketApiRetryCount'),
            timeout: Cypress.env('marketApiTimeout')
          }).as('eventsAfterAmendment')
        })

        cy.get('@orderDataAfterAmendment').as('finalProjection')

        cy.all(
          cy.get('@confirmedAmendedTraderOrder'),
          cy.get('@orderDataBeforeAmendment'),
          cy.get('@orderDataAfterAmendment'),
          cy.get('@eventsAfterAmendment'),
          cy.get('@finalProjection')
        ).then(([amendedOrder, beforeData, afterData, afterEvents, finalProjection]) => {
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
