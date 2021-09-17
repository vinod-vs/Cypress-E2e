/// <reference types="cypress" />
/* eslint-disable no-unused-expressions */

import shoppers from '../../../fixtures/everydayMarket/shoppers.json'
import TestFilter from '../../../support/TestFilter'
import '../../../support/login/api/commands/login'
import '../../../support/search/api/commands/search'
import '../../../support/fulfilment/api/commands/fulfilment'
import '../../../support/sideCart/api/commands/clearTrolley'
import '../../../support/sideCart/api/commands/addItemsToTrolley'
import '../../../support/checkout/api/commands/navigateToCheckout'
import '../../../support/checkout/api/commands/confirmOrder'
import '../../../support/payment/api/commands/creditcard'
import '../../../support/payment/api/commands/digitalPayment'
import '../../../support/rewards/api/commands/rewards'
import '../../../support/refunds/api/commands/commands'
import '../../../support/everydayMarket/api/commands/orderApi'
import '../../../support/everydayMarket/api/commands/marketplacer'
import '../../../support/everydayMarket/api/commands/utility'
import tests from '../../../fixtures/everydayMarket/apiTests.json'
import * as lib from '../../../support/everydayMarket/api/commands/commonHelpers'

TestFilter(['test'], () => {
    describe('[API] MPPF-902 | EM | MPer | Full cancellation of Everyday Market order via Marketplacer', () => {
        before(() => {
            cy.clearCookies({ domain: null })
            cy.clearLocalStorage({ domain: null })
        })

        it('RP-902 | EM | MPer | Full cancellation of Everyday Market order via Marketplacer', () => {
            //expect(1).to.be.greaterThan(5)
            //cy.orderEventsApiWithRetry('9391J-1WGKCF', {

              cy.orderEventsApiWithRetry('9391J-1WGZBR', {
                function: function (response) {
                  if (!response.body.data.some((element) => element.domainEvent === 'RefundRequestUpdate') ||
                      !response.body.data.some((element) => element.domainEvent === 'MarketOrderRefund') ||
                      !response.body.data.some((element) => element.domainEvent === 'RefundCompleted')) {
                        cy.log('Expected RefundRequestUpdate, MarketOrderRefund & RefundCompleted were not present')
                        throw new Error('Expected RefundRequestUpdate, MarketOrderRefund & RefundCompleted were not present')
                      }
                },
                retries: 15,
                timeout: 5000
              }).then((response) => {
                // Verify there are only 7 events. New event after seller cancellattion 
                lib.verifyEventDetails(response, 'RefundRequestUpdate', testData, shopperId, 3)
                // lib.verifyEventDetails1(response, 'RefundRequestUpdate', testData, shopperId)
                // lib.verifyEventDetails1(response, 'RefundRequestUpdate', testData, shopperId)
                lib.verifyEventDetails(response, 'MarketOrderRefund', testData, shopperId, 1)
                lib.verifyEventDetails(response, 'RefundCompleted', testData, shopperId, 1)
              })
        })
    })
})
