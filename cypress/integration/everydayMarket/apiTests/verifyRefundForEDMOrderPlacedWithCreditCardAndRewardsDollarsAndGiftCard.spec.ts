/// <reference types="cypress" />
/* eslint-disable no-unused-expressions */

import shoppers from '../../../fixtures/everydayMarket/shoppers.json'
import eventsRequest from '../../../fixtures/everydayMarket/events.json'
import search from '../../../fixtures/everydayMarket/search.json'
import TestFilter from '../../../support/TestFilter'
import '../../../support/login/api/commands/login'
import '../../../support/everydayMarket/api/commands/orderApi'
import '../../../support/everydayMarket/api/commands/marketplacer'
import '../../../support/everydayMarket/api/commands/orderPlacementHelpers'
import '../../../support/orderPaymentService/api/commands/refunds'

TestFilter(['EDM-API'], () => {
  describe('[API] RP-5110 - EM | Refunds | Verify refunds happens to the right payment mode for market orders placed via CC + RD + GC', () => {
    before(() => {
      cy.clearCookies({ domain: null })
      cy.clearLocalStorage({ domain: null })
    })

    it('RP-5110 - EM | Refunds | Verify refunds happens to the right payment mode for market orders placed via CC + RD + GC', () => {
      const purchaseQty = 2
      const cancelledQty = 2
      const shopper = shoppers.emAccount2
      const rewardsDollarsToRedeem = 10
      let req: any

      // Login using shopper saved in the fixture and verify it's successful
      cy.loginViaApi(shopper).its('LoginResult').should('eq', 'Success')

      // Place single line item EDM order with quantity = 2, using 'treats' as search term
      // and grab the first any available EDM item returned by search
      cy.prepareAnySingleLineItemEdmOrder(search.searchTerm, purchaseQty)
      cy.redeemRewardsDollars(rewardsDollarsToRedeem)
      cy.placeOrderUsingCreditCardAndGiftCard().as('confirmedTraderOrder')

      cy.get('@confirmedTraderOrder').then((confirmedOrder: any) => {
        req = {
          ...eventsRequest,
          shopperId: shopper.shopperId,
          orderId: confirmedOrder.Order.OrderId,
          orderReference: confirmedOrder.Order.OrderReference
        }

        // Call Market Order API and validate the data
        cy.ordersApiByShopperIdAndTraderOrderIdWithRetry(req.shopperId, req.orderId, {
          function: function (response: any) {
            if (response.body.invoices[0].wowStatus !== 'Placed') {
              throw new Error('Still not sent to Marketplacer yet')
            }
          },
          retries: Cypress.env('marketApiRetryCount'),
          timeout: Cypress.env('marketApiTimeout')
        }).as('placedMarketOrderApiData')

      })

      // Perform seller full cancellation to EDM order
      cy.get('@placedMarketOrderApiData').then((data: any) => {
        cy.cancelLineItemInInvoice(data.invoices[0].invoiceId, data.invoices[0].lineItems[0].lineItemId, cancelledQty, false)
          .then(() => {
            cy.ordersApiByShopperIdAndTraderOrderIdWithRetry(data.shopperId, data.orderId, {
              function: function (response: any) {
                if (response.body.invoices[0].wowStatus !== 'SellerCancelled') {
                  throw new Error('Still not cancelled yet')
                }
              },
              retries: Cypress.env('marketApiRetryCount'),
              timeout: Cypress.env('marketApiTimeout')
            })
          })

        cy.getAllRefundsByOrderId(data.orderId).as('refundsDetails')
        cy.get('@refundsDetails').then((refundsDetails: any) => {
          cy.getAllRefundPaymentsByRefundId(refundsDetails.refunds[0].id).as('refundPaymentsDetails')
        })
        cy.get('@refundPaymentsDetails').then((refundPaymentsDetails: any) => {          
          // Find credit card refund payment
          expect(cy.findCCRefundPayment(refundPaymentsDetails, data.invoices[0].invoiceTotal - 0.01)).is.not.null

          // Find rewards dollars refund payment
          // Rewards will always be refunded as store credit
          expect(cy.findSCRefundPayment(refundPaymentsDetails, rewardsDollarsToRedeem)).is.not.null

          // Find gift card refund payment (we always redeem $0.01 using gift card)
          // Gift card will always be refunded as store credit
          expect(cy.findSCRefundPayment(refundPaymentsDetails, 0.01)).is.not.null
        })
      })
    })
  })
})
