/// <reference types="cypress" />
/* eslint-disable no-unused-expressions */

import eventsRequest from '../../../../../fixtures/everydayMarket/events.json'
import TestFilter from '../../../../../support/TestFilter'
import '../../../../../support/login/api/commands/login'
import '../../../../../support/everydayMarket/api/commands/orderApi'
import '../../../../../support/everydayMarket/api/commands/marketplacer'
import '../../../../../support/everydayMarket/api/commands/orderPlacementHelpers'
import '../../../../../support/rewards/api/commands/rewards'
import '../../../../../support/refunds/api/commands/commands'
import '../../../../../support/orders/api/commands/amendOrder'
import search from '../../../../../fixtures/everydayMarket/search.json'
import { refundRequestInitiatorType } from '../../../../../support/everydayMarket/common/refundRequestInitiatorType'

TestFilter(['EDM', 'API', 'EDM-E2E-API', 'E2E-Scenario-1'], () => {
  describe('[API] RP-5217 - EM | Customer gets refund for the items partially cancelled by ADMIN', () => {
    before(() => {
      cy.clearCookies({ domain: null })
      cy.clearLocalStorage({ domain: null })
    })

    it('[API] RP-5217 - EM | Customer gets refund for the items partially cancelled by ADMIN', () => {
      const purchaseQty = 2
      const cancelledQty = 1
      let shopperId: any
      let req: any

      // Sign up for a new shopper
      cy.loginWithNewShopperViaApi()

      cy.get('@signUpResponse').then((signUpResp: any) => {
        shopperId = signUpResp.ShopperId
      })

      // Place single line item EDM order with quantity = 2, using 'pets' as search term
      // and grab the first any available EDM item returned by search
      cy.prepareAnySingleLineItemEdmOrder(search.searchTerm, purchaseQty)
      cy.placeOrderUsingCreditCard().as('confirmedTraderOrder')

      cy.get('@confirmedTraderOrder').then((confirmedOrder: any) => {
        req = {
          ...eventsRequest,
          shopperId: shopperId,
          orderId: confirmedOrder.Order.OrderId,
          orderReference: confirmedOrder.Order.OrderReference,
        }

        // Call Market Order Events API and validate the data before order being partially admin cancelled
        cy.orderEventsApiWithRetry(req.orderReference, {
          function: function (response: any) {
            if (
              !response.body.data.some(
                (element: any) => element.domainEvent === 'OrderPlaced'
              ) ||
              !response.body.data.some(
                (element: any) => element.domainEvent === 'MarketOrderPlaced'
              )
            ) {
              cy.log('Expected OrderPlaced & MarketOrderPlaced to be present')
              throw new Error(
                'Expected OrderPlaced & MarketOrderPlaced to be present'
              )
            }
          },
          retries: Cypress.env('marketApiRetryCount'),
          timeout: 10000,
        })

        // Call Market Order API and validate the data before order being partially admin cancelled
        cy.ordersApiByShopperIdAndTraderOrderIdWithRetry(
          req.shopperId,
          req.orderId,
          {
            function: function (response: any) {
              if (
                response.body.invoices[0].orderTrackingStatus !== 'Received'
              ) {
                cy.log('Expected orderTrackingStatus to be "Received"')
                throw new Error('Expected orderTrackingStatus to be "Received"')
              }
            },
            retries: Cypress.env('marketApiRetryCount'),
            timeout: Cypress.env('marketApiTimeout'),
          }
        ).then((response: any) => {
          // Perform partial admin cancellation on the EDM order (1 out of 2 items)
          cy.refundRequestCreateInitiatedBy(
            response.invoices[0].invoiceId,
            response.invoices[0].lineItems[0].lineItemId,
            cancelledQty,
            false,
            refundRequestInitiatorType.ADMIN
          )

          cy.ordersApiByShopperIdAndTraderOrderIdWithRetry(
            req.shopperId,
            req.orderId,
            {
              function: function (response: any) {
                if (response.body.invoices[0].refunds[0].id == null) {
                  cy.log('Refund ID is still null')
                  throw new Error('Refund ID is still null')
                }
              },
              retries: Cypress.env('marketApiRetryCount'),
              timeout: Cypress.env('marketApiTimeout'),
            }
          ).then((response: any) => {
            cy.refundRequestReturn(response.invoices[0].refunds[0].id)
          })
        })

        // Call Market Order Events API and validate the data after order being partially admin cancelled
        cy.orderEventsApiWithRetry(req.orderReference, {
          function: function (response: any) {
            if (
              !response.body.data.some(
                (element: any) => element.domainEvent === 'MarketOrderRefund'
              ) ||
              !response.body.data.some(
                (element: any) => element.domainEvent === 'RefundCompleted'
              )
            ) {
              cy.log(
                'Expected MarketOrderRefund & RefundCompleted to be present'
              )
              throw new Error(
                'Expected MarketOrderRefund & RefundCompleted to be present'
              )
            }
          },
          retries: Cypress.env('marketApiRetryCount'),
          timeout: 10000,
        })

        // Call Market Order API and validate the data after order being partially admin cancelled
        cy.ordersApiByShopperIdAndTraderOrderIdWithRetry(
          req.shopperId,
          req.orderId,
          {
            function: function (response: any) {
              if (response.body.invoices[0].invoiceStatus !== 'REFUNDED') {
                cy.log('Expected invoiceStatus to be "REFUNDED"')
                throw new Error('Expected invoiceStatus to be "REFUNDED"')
              }
            },
            retries: Cypress.env('marketApiRetryCount'),
            timeout: Cypress.env('marketApiTimeout'),
          }
        ).then((response: any) => {
          expect(response.invoices[0].refunds[0]).to.not.be.null
          expect(response.invoices[0].refunds[0].initiatedBy).to.be.equal(
            'ADMIN'
          )
          expect(response.invoices[0].orderTrackingStatus).to.be.equal(
            'Cancelled'
          )
        })
      })
    })
  })
})
