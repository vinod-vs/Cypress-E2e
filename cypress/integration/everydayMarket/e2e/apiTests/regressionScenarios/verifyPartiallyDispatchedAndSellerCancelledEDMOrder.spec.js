/// <reference types="cypress" />
/* eslint-disable no-unused-expressions */

import shoppers from '../../../../../fixtures/everydayMarket/shoppers.json'
import eventsRequest from '../../../../../fixtures/everydayMarket/events.json'
import shipment from '../../../../../fixtures/everydayMarket/shipment.json'
import sellerCancellation from '../../../../../fixtures/everydayMarket/sellerCancellation.json'
import search from '../../../../../fixtures/everydayMarket/search.json'
import rewards from '../../../../../fixtures/everydayMarket/rewards.json'
import TestFilter from '../../../../../support/TestFilter'
import '../../../../../support/login/api/commands/login'
import '../../../../../support/everydayMarket/api/commands/orderApi'
import '../../../../../support/everydayMarket/api/commands/marketplacer'
import '../../../../../support/everydayMarket/api/commands/utility'
import '../../../../../support/everydayMarket/api/commands/orderPlacementHelpers'
import '../../../../../support/rewards/api/commands/rewards'
import '../../../../../support/refunds/api/commands/commands'
import * as lib from '../../../../../support/everydayMarket/api/commands/validationHelpers'
import * as refundsLib from '../../../../../support/everydayMarket/api/commands/commonHelpers'

TestFilter(['EDM', 'API', 'EDM-E2E-API'], () => {
  describe('[API] RP-5044 - Partial Dispatch and Partial seller cancellation (partial OOS) Everyday Market order. {Failing because of BUG: MPPF-1450}', () => {
    before(() => {
      cy.clearCookies({ domain: null })
      cy.clearLocalStorage({ domain: null })
    })

    it('RP-5044 - Partial Dispatch and Partial seller cancellation (partial OOS) Everyday Market order. {Failing because of BUG: MPPF-1450}', () => {
      const purchaseQty = 2
      const dispatchQty = 1
      const cancelledQty = 1
      let req
      const shopper = shoppers.emAccountWithRewards24

      // Login using shopper saved in the fixture and verify it's successful
      cy.loginViaApiAndHandle2FA(shopper)

      // Place single line item EDM order with quantity = 2, using 'treats' as search term
      // and grab the first any available EDM item returned by search
      cy.prepareAnySingleLineItemEdmOrder(search.searchTerm, purchaseQty)
      cy.placeOrderUsingCreditCard().as('confirmedTraderOrder')

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
          retries: Cypress.env('marketApiRetryCount'),
          timeout: Cypress.env('marketApiTimeout')
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
            if (!response.body.data.some((element) => element.domainEvent === 'OrderPlaced') ||
                            !response.body.data.some((element) => element.domainEvent === 'MarketOrderPlaced')) {
              cy.log('Expected OrderPlaced & MarketOrderPlaced to be present')
              throw new Error('Expected OrderPlaced & MarketOrderPlaced to be present')
            }
          },
          retries: Cypress.env('marketApiRetryCount'),
          timeout: Cypress.env('marketApiTimeout')
        }).then((response) => {
          lib.validateEvents(response, 'OrderPlaced', 1)
          lib.validateEvents(response, 'MarketOrderPlaced', 1)
        })

        // Get reward points before we start dispatching/OOSing items via Marketplacer
        if (Cypress.env('marketRewardPointsValidationSwitch')) {
          cy.log('marketRewardPointsValidationSwitch is enabled. Performing validations.')

          cy.getRewardsCardDetails(rewards.partnerId, rewards.siteId, rewards.posId, rewards.loyaltySiteType, shopper.rewardsCardNumber)
            .its('queryCardDetailsResp').its('pointBalance').as('rewardBalanceBefore')
        }
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
              retries: Cypress.env('marketApiRetryCount'),
              timeout: Cypress.env('marketApiTimeout')
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
                if (!response.body.data.some((element) => element.domainEvent === 'MarketOrderShipmentCreate') ||
                                    !response.body.data.some((element) => element.domainEvent === 'MarketOrderDispatched') ||
                                    !response.body.data.some((element) => element.domainEvent === 'MarketRewardsCredited')) {
                  cy.log('Expected MarketOrderShipmentCreate, MarketOrderDispatched & MarketRewardsCredited to be present')
                  throw new Error('Expected MarketOrderShipmentCreate, MarketOrderDispatched & MarketRewardsCredited to be present')
                }
              },
              retries: Cypress.env('marketApiRetryCount'),
              timeout: Cypress.env('marketApiTimeout')
            }).then((response) => {
              lib.validateEvents(response, 'MarketOrderShipmentCreate', 1)
              lib.validateEvents(response, 'MarketOrderDispatched', 1)
              lib.validateEvents(response, 'MarketRewardsCredited', 1)
            })
          })

        // Partial seller cancellation - mark the last item as OOS via Marketplacer
        cy.cancelLineItemInInvoice(data.invoices[0].invoiceId, data.invoices[0].lineItems[0].lineItemId, cancelledQty, false)
          .then(() => {
            cy.orderEventsApiWithRetry(req.orderReference, {
              function: function (response) {
                if (!response.body.data.some((element) => element.domainEvent === 'RefundRequestUpdate') ||
                                    !response.body.data.some((element) => element.domainEvent === 'MarketOrderRefund') ||
                                    !response.body.data.some((element) => element.domainEvent === 'RefundCompleted')) {
                  cy.log('Expected RefundRequestUpdate, MarketOrderRefund & RefundCompleted to be present')
                  throw new Error('Expected RefundRequestUpdate, MarketOrderRefund & RefundCompleted to be present')
                }
              },
              retries: Cypress.env('marketApiRetryCount'),
              timeout: Cypress.env('marketApiTimeout')
            }).then((response) => {
              lib.validateEvents(response, 'RefundRequestUpdate', 3) // Returned, Create, Refunded
              lib.validateEvents(response, 'MarketOrderRefund', 1)
              lib.validateEvents(response, 'RefundCompleted', 1)
            })

            cy.ordersApiByShopperIdAndTraderOrderIdWithRetry(data.shopperId, data.orderId, {
              function: function (response) {
                if (response.body.invoices[0].wowStatus !== 'Shipped') {
                  cy.log('WOW status is not "Shipped" yet')
                  throw new Error('Still not fully shipped yet')
                }
              },
              retries: Cypress.env('marketApiRetryCount'),
              timeout: Cypress.env('marketApiTimeout')
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

            // Validate rewards points to ensure points get accumulated for dispatched items only
            if (Cypress.env('marketRewardPointsValidationSwitch')) {
              cy.log('marketRewardPointsValidationSwitch is enabled. Performing validations.')

              cy.getRewardsCardDetails(rewards.partnerId, rewards.siteId, rewards.posId, rewards.loyaltySiteType, shopper.rewardsCardNumber)
                .its('queryCardDetailsResp').its('pointBalance').as('rewardBalanceAfter')

              cy.all(
                cy.get('@rewardBalanceBefore'),
                cy.get('@rewardBalanceAfter'),
                cy.get('@cancelledOrderProjection')
              ).then(([before, after, cancelledOrderProjection]) => {
                expect(after).to.be.greaterThan(before)
                const expectedRewards = Math.floor(Number(before) + Number(cancelledOrderProjection.invoices[0].refunds[0].refundItems[0].amount))
                expect(Number(after)).to.be.gte(Number(expectedRewards))
              })
            }
          })
      })

      // Verify the refund is only for the cancelled item and the shipping fee is not returned
      cy.get('@cancelledOrderProjection').then((cancelledProjection) => {
        cy.log('cancelledProjection.invoices[0].refunds[0].refundAmount: ' + cancelledProjection.invoices[0].refunds[0].refundAmount)
        refundsLib.verifyRefundDetails(req.orderId, cancelledProjection.invoices[0].refunds[0].refundAmount, 0)
      })

      // TODO: Add invoice verifications
    })
  })
})
