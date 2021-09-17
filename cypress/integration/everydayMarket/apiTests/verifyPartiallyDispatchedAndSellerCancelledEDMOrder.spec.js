/// <reference types="cypress" />
/* eslint-disable no-unused-expressions */

import shoppers from '../../../fixtures/everydayMarket/shoppers.json'
import eventsRequest from '../../../fixtures/everydayMarket/events.json'
import shipment from '../../../fixtures/everydayMarket/shipment.json'
import sellerCancellation from '../../../fixtures/everydayMarket/sellerCancellation.json'
import search from '../../../fixtures/everydayMarket/search.json'
import rewards from '../../../fixtures/everydayMarket/rewards.json'
import TestFilter from '../../../support/TestFilter'
import '../../../support/login/api/commands/login'
import '../../../support/everydayMarket/api/commands/orderApi'
import '../../../support/everydayMarket/api/commands/marketplacer'
import '../../../support/everydayMarket/api/commands/utility'
import '../../../support/rewards/api/commands/rewards'
import '../../../support/refunds/api/commands/commands'
import * as lib from '../../../support/everydayMarket/api/commands/validationHelpers'

TestFilter(['B2C-API', 'EDM-API'], () => {
  describe('[API] RP-5044 | EM | MPer | Partial Dispatch and Partial seller cancellation (partial OOS) Everyday Market order', () => {
    before(() => {
      cy.clearCookies({ domain: null })
      cy.clearLocalStorage({ domain: null })
    })

    it('RP-5044 | EM | MPer | Partial Dispatch and Partial seller cancellation (partial OOS) Everyday Market order', () => {
      const purchaseQty = 2
      const dispatchQty = 1
      const cancelledQty = 1
      let req
      const shopper = shoppers.emAccount2

      // Login using shopper saved in the fixture and verify it's successful
      cy.loginViaApi(shopper).its('LoginResult').should('eq', 'Success')

      // Place single line item EDM order with quantity = 2, using 'treats' as search term
      // and grab the first any available EDM item returned by search
      cy.placeAnySingleLineItemEdmOrder(search.searchTerm, purchaseQty).as('confirmedTraderOrder')

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
        }).as('placedMarketOrderApiData').then((response) => {
          lib.validateOrderApiAgainstTrader(response)
          expect(response.invoices[0].invoiceStatus).is.equal('PAID')
          expect(response.invoices[0].wowStatus).is.equal('Placed')
          // Validate line items
          expect(response.invoices[0].lineItems[0].refundableQuantity).is.equal(0)
          // Validate refunds
          expect(response.invoices[0].refunds).is.empty
          // Validate shipments
          expect(response.invoices[0].shipments).is.empty
        })

        // Call the Market Events API and validate the data
        cy.orderEventsApiWithRetry(req.orderReference, {
          function: function (response) {
            if (response.body.pagination.total !== 2) {
              throw new Error('Events not completed yet')
            }
          },
          retries: 15,
          timeout: 2000
        }).then((response) => {
          lib.validateEvents(response, 0, 'OrderPlaced')
          lib.validateEvents(response, 1, 'MarketOrderPlaced')
        })

        // Get reward points before we start dispatching/OOSing items via Marketplacer
        cy.getRewardsCardDetails(rewards.partnerId, rewards.siteId, rewards.posId, rewards.loyaltySiteType, shopper.rewardsCardNumber)
          .its('queryCardDetailsResp').its('pointBalance').as('rewardBalanceBefore')
      })

      // Partial dispatch - dispatch 1 out of the 2 items via Marketplacer
      cy.get('@placedMarketOrderApiData').then((data) => {
        cy.partialDispatchOfLineItemsInInvoice(data.invoices[0].legacyId, [{ line_item_id: data.invoices[0].lineItems[0].legacyId, quantity: dispatchQty }], shipment.postageTrackingnumber, shipment.postageCarrier, data.invoices[0].seller.sellerName)
          .then(() => {
            cy.ordersApiByShopperIdAndTraderOrderIdWithRetry(data.shopperId, data.orderId, {
              function: function (response) {
                if (response.body.invoices[0].wowStatus !== 'PartiallyShipped') {
                  throw new Error('Still not shipped yet')
                }
              },
              retries: 10,
              timeout: 5000
            }).then((response) => {
              expect(response.invoices[0].invoiceStatus).is.equal('PARTIALLY_SENT')
              expect(response.invoices[0].wowStatus).is.equal('PartiallyShipped')
              // Validate line items
              expect(response.invoices[0].lineItems[0].refundableQuantity).is.equal(dispatchQty)
              // Validate refunds
              expect(response.invoices[0].refunds).is.empty
              // Validate shipments
              expect(response.invoices[0].shipments[0].carrier).is.equal(shipment.postageCarrier)
              expect(response.invoices[0].shipments[0].trackingNumber).is.equal(shipment.postageTrackingnumber)
              expect(response.invoices[0].shipments[0].shippedItems[0].stockCode).is.equal(data.invoices[0].lineItems[0].stockCode)
              expect(response.invoices[0].shipments[0].shippedItems[0].quantity).is.equal(dispatchQty)
            })

            // Call the Market Events API and validate the data
            cy.orderEventsApiWithRetry(data.orderReference, {
              function: function (response) {
                if (response.body.pagination.total !== 7) {
                  throw new Error('Events not completed yet')
                }
              },
              retries: 15,
              timeout: 2000
            }).then((response) => {
              lib.validateEvents(response, 2, 'MarketOrderShipmentCreate')
              lib.validateEvents(response, 3, 'update')
              lib.validateEvents(response, 4, 'MarketOrderDispatched')
              lib.validateEvents(response, 5, 'MarketRewardsCredited')
              lib.validateEvents(response, 6, 'update')
            })
          })

        // Partial seller cancellation - mark the last item as OOS via Marketplacer
        cy.cancelLineItemInInvoice(data.invoices[0].invoiceId, data.invoices[0].lineItems[0].lineItemId, cancelledQty)
          .then(() => {
            cy.ordersApiByShopperIdAndTraderOrderIdWithRetry(data.shopperId, data.orderId, {
              function: function (response) {
                if (response.body.invoices[0].wowStatus !== 'Shipped') {
                  throw new Error('Still not fully shipped yet')
                }
              },
              retries: 10,
              timeout: 5000
            }).as('cancelledOrderProjection').then((response) => {
              expect(response.invoices[0].invoiceStatus).is.equal('REFUNDED')
              expect(response.invoices[0].wowStatus).is.equal('Shipped')
              // Validate line items
              expect(response.invoices[0].lineItems[0].refundableQuantity).is.equal(dispatchQty)
              // Validate refunds
              expect(response.invoices[0].refunds[0].refundAmount).is.equal(cancelledQty * data.invoices[0].lineItems[0].salePrice)
              expect(response.invoices[0].refunds[0].totalAmount).is.equal(cancelledQty * data.invoices[0].lineItems[0].salePrice)
              expect(response.invoices[0].refunds[0].status).is.equal('Refunded')
              // Validate refund items
              expect(response.invoices[0].refunds[0].refundItems[0].reason).is.equal(sellerCancellation.reason)
              expect(response.invoices[0].refunds[0].refundItems[0].quantity).is.equal(cancelledQty)
              expect(response.invoices[0].refunds[0].refundItems[0].amount).is.equal(cancelledQty * data.invoices[0].lineItems[0].salePrice)
              // Validate refund items line items
              expect(response.invoices[0].refunds[0].refundItems[0].lineItem.stockCode).is.equal(data.invoices[0].lineItems[0].stockCode)
              expect(response.invoices[0].refunds[0].refundItems[0].lineItem.quantity).is.equal(data.invoices[0].lineItems[0].quantity)
              expect(response.invoices[0].refunds[0].refundItems[0].lineItem.salePrice).is.equal(data.invoices[0].lineItems[0].salePrice)
              // Validate shipments
              expect(response.invoices[0].shipments[0].carrier).is.equal(shipment.postageCarrier)
              expect(response.invoices[0].shipments[0].trackingNumber).is.equal(shipment.postageTrackingnumber)
              expect(response.invoices[0].shipments[0].shippedItems[0].stockCode).is.equal(data.invoices[0].lineItems[0].stockCode)
              expect(response.invoices[0].shipments[0].shippedItems[0].quantity).is.equal(dispatchQty)
            })
            // Call the Market Events API and validate the data
            cy.orderEventsApiWithRetry(data.orderReference, {
              function: function (response) {
                if (response.body.pagination.total !== 14) {
                  throw new Error('Events not completed yet')
                }
              },
              retries: 15,
              timeout: 2000
            }).then((response) => {
              lib.validateEvents(response, 7, 'RefundRequestUpdate') // Returned
              lib.validateEvents(response, 8, 'RefundRequestUpdate') // Create
              lib.validateEvents(response, 9, 'RefundRequestUpdate') // Refunded
              lib.validateEvents(response, 10, 'update')
              lib.validateEvents(response, 11, 'MarketOrderRefund')
              lib.validateEvents(response, 12, 'RefundCompleted')
              lib.validateEvents(response, 13, 'update')
            })
            // Validate rewards points to ensure points get accumulated for dispatched items only
            cy.getRewardsCardDetails(rewards.partnerId, rewards.siteId, rewards.posId, rewards.loyaltySiteType, shopper.rewardsCardNumber)
              .its('queryCardDetailsResp').its('pointBalance').as('rewardBalanceAfter')

            cy.all(
              cy.get('@rewardBalanceBefore'),
              cy.get('@rewardBalanceAfter')
            ).then(([before, after]) => {
              // TODO: Improve with proper validation of rewards points earning
            })
          })
      })

      // TODO: Add back once the failure is fixed
      // //Verify the refund is only for the cancelled item and the shipping fee is not returned
      // cy.get('@cancelledOrderProjection').then((cancelledProjection) => {
      //   cy.log('cancelledProjection.invoices[0].refunds[0].refundAmount: ' + cancelledProjection.invoices[0].refunds[0].refundAmount)
      //   lib.verifyRefundDetails(req.orderId, cancelledProjection.invoices[0].refunds[0].refundAmount, 0)
      // })

      // TODO: Add invoice verifications
    })
  })
})
