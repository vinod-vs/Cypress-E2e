/// <reference types="cypress" />
/* eslint-disable no-unused-expressions */

import shoppers from '../../../fixtures/everydayMarket/shoppers.json'
import eventsRequest from '../../../fixtures/everydayMarket/events.json'
import search from '../../../fixtures/everydayMarket/search.json'
import TestFilter from '../../../support/TestFilter'
import '../../../support/login/api/commands/login'
import '../../../support/everydayMarket/api/commands/orderApi'
import '../../../support/everydayMarket/api/commands/marketplacer'
import '../../../support/everydayMarket/api/commands/utility'
import '../../../support/rewards/api/commands/rewards'
import '../../../support/refunds/api/commands/commands'
import '../../../support/orders/api/commands/amendOrder'
import * as lib from '../../../support/everydayMarket/api/commands/validationHelpers'

TestFilter(['B2C-API', 'EDM-API'], () => {
  describe('[API] RP-5044 | EM | MPer | Partial Dispatch and Partial seller cancellation (partial OOS) Everyday Market order', () => {
    before(() => {
      cy.clearCookies({ domain: null })
      cy.clearLocalStorage({ domain: null })
    })

    it('RP-5044 | EM | MPer | Partial Dispatch and Partial seller cancellation (partial OOS) Everyday Market order', () => {
      const purchaseQty = 2
      const shopper = shoppers.emAccount2
      let req

      // Login using shopper saved in the fixture and verify it's successful
      cy.loginViaApi(shopper).its('LoginResult').should('eq', 'Success')

      // Place single line item EDM order with quantity = 2, using 'treats' as search term
      // and grab the first any available EDM item returned by search
      cy.placeAnySingleLineItemWowAndEdmOrder(search.searchTerm, purchaseQty).as('confirmedTraderOrder')

      cy.get('@confirmedTraderOrder').then((confirmedOrder) => {
        req = {
          ...eventsRequest,
          shopperId: shopper.shopperId,
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
          retries: 10,
          timeout: 5000
        }).its('invoices').its(0).its('legacyIdFormatted').as('invoiceIds')

        cy.orderEventsApiWithRetry(req.orderReference, {
          function: function (response) {
            if (response.body.pagination.total !== 3) {
              throw new Error('Event not updated yet')
            }
          },
          retries: 15,
          timeout: 2000
        })

        cy.get('@invoiceIds').then((invoiceIds) => {
          cy.ordersApiByEdmInvoiceIdWithRetry(invoiceIds, {
            function: function (response) {
              if (response.status !== 200) {
                throw new Error('Still wrong status')
              }
            },
            retries: 10,
            timeout: 5000
          }).as('orderDataBeforeAmendment')
        })

        // Amend the WOW part of the order
        cy.completeOrderAmendment(req.orderId, search.searchTerm).as('confirmedAmendedTraderOrder').then(() => {
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
              retries: 10,
              timeout: 5000
            }).as('orderDataAfterAmendment')
          })

          // Call the Market Events API and save the events data in an alias
          cy.orderEventsApiWithRetry(req.orderReference, {
            function: function (response) {
              if (response.body.pagination.total !== 4) {
                throw new Error('Event not updated yet')
              }
            },
            retries: 15,
            timeout: 2000
          }).as('eventsAfterAmendment')
        })

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

          // Validate EDM order events after amendment to have 'update' and 'OrderPlaced' events
          lib.validateEvents(afterEvents, 2, 'update')
          lib.validateEvents(afterEvents, 3, 'OrderPlaced')
        })
      })
    })
  })
})
