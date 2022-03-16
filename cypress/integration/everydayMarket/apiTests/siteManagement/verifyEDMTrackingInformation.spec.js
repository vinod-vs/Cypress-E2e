/// <reference types="cypress" />
/* eslint-disable no-unused-expressions */

import shoppers from '../../../../fixtures/everydayMarket/shoppers.json'
import rewardsDetails from '../../../../fixtures/everydayMarket/rewards.json'
import TestFilter from '../../../../support/TestFilter'
import '../../../../support/login/api/commands/login'
import '../../../../support/search/api/commands/search'
import eventsRequest from '../../../../fixtures/everydayMarket/events.json'
import shipment from '../../../../fixtures/everydayMarket/shipment.json'
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
import '../../../../support/everydayMarket/api/commands/orderPlacementHelpers'
import search from '../../../../fixtures/everydayMarket/search.json'
import tests from '../../../../fixtures/everydayMarket/apiTests.json'
import * as refundsLib from '../../../../support/everydayMarket/api/commands/commonHelpers'
import * as lib from '../../../../support/everydayMarket/api/commands/validationHelpers'
import "../../../../support/everydayMarket/ui/commands/siteManagementHelpers";
import "../../../../support/everydayMarket/ui/commands/siteManagementValidationHelpers"
import smLogins from '../../../../fixtures/siteManagement/loginDetails.json'

TestFilter(['EDM', 'API'], () => {
    describe('[API] RP-5477 - EDM - Automatically capture any updates to the tracking information', () => {
      before(() => {
        cy.clearCookies({ domain: null })
        cy.clearLocalStorage({ domain: null })
      })
  
      it('[API] RP-5477 - EDM - Automatically capture any updates to the tracking information', () => {
        const purchaseQty = 5
        const dispatchQty = 2
        const searchTerm = 'treats'
        let req
        let shipmentId
        const shopper = shoppers.emAccount2
        const updatedTrackingNumber = 'Update12345'
  
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
            }).as('finalProjection').then((response) => {
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

            cy.get('@finalProjection').then((data) => {

                // Partial dispatch - dispatch 2 out of the 5 items via Marketplacer
                cy.partialDispatchOfLineItemsInInvoice(data.invoices[0].legacyId, [{ line_item_id: data.invoices[0].lineItems[0].legacyId, quantity: dispatchQty }], shipment.postageTrackingnumber, shipment.postageCarrier, data.invoices[0].seller.sellerName).then((response) => {
                    shipmentId = response.data.id
                    cy.log('Shipment id is '+shipmentId)
                    cy.ordersApiByShopperIdAndTraderOrderIdWithRetry(data.shopperId, data.orderId, {
                    function: function (response) {
                        if (response.body.invoices[0].wowStatus !== 'PartiallyShipped') {
                        throw new Error('Still not shipped yet')
                        }
                    },
                    retries: Cypress.env('marketApiRetryCount'),
                    timeout: Cypress.env('marketApiTimeout')
                    }).as('finalProjection').then((response) => {
                    expect(response.invoices[0].invoiceStatus).is.equal('PARTIALLY_SENT')
                    expect(response.invoices[0].wowStatus).is.equal('PartiallyShipped')
                    response.invoices[0].wowStatus = "Partially shipped"
                    // Validate line items
                    expect(response.invoices[0].lineItems[0].refundableQuantity).is.equal(dispatchQty)
                    response.invoices[0].lineItems[0].totalAmount = dispatchQty * response.invoices[0].lineItems[0].salePrice
                    
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
                                            !response.body.data.some((element) => element.domainEvent === 'MarketOrderDispatched')){
                        cy.log('Expected MarketOrderShipmentCreate, MarketOrderDispatched & MarketRewardsCredited to be present')
                        throw new Error('Expected MarketOrderShipmentCreate, MarketOrderDispatched & MarketRewardsCredited to be present')
                        }
                    },
                    retries: Cypress.env('marketApiRetryCount'),
                    timeout: Cypress.env('marketApiTimeout')
                    }).then((response) => {
                    lib.validateEvents(response, 'MarketOrderShipmentCreate', 1)
                    lib.validateEvents(response, 'MarketOrderDispatched', 1)
                    })

                    //Login to SM and verify the order details
                    cy.loginToSMAndSearchOrder(smLogins, req.orderId)
                    cy.validateOrderDetailsOnSM(true);

                    //Update shipping tracking number
                    cy.updateShippingInformation(shipmentId, data.invoices[0].legacyId, updatedTrackingNumber, data.invoices[0].seller.sellerName).then((response) => {
                        expect(response.data.attributes.shipment_tracking_number).is.equal(updatedTrackingNumber)
                        cy.log()
                    })
                })

                //Get Projection And Verify Updated Tracking Number
                cy.wait(Cypress.config('tenSecondWait'))
                cy.ordersApiByShopperIdAndTraderOrderIdWithRetry(req.shopperId, req.orderId, {
                    function: function (response) {
                    if (response.body.invoices[0].wowStatus !== 'PartiallyShipped') {
                        throw new Error('Still not shipped yet')
                    }
                    },
                    retries: Cypress.env('marketApiRetryCount'),
                    timeout: Cypress.env('marketApiTimeout')
                }).as('finalProjection').then((response) => {
                    expect(response.invoices[0].shipments[0].trackingNumber).is.equal(updatedTrackingNumber)
                    response.invoices[0].wowStatus = "Partially shipped"
                    response.invoices[0].lineItems[0].totalAmount = dispatchQty * response.invoices[0].lineItems[0].salePrice
                })

                //Search Order in SM and verify the Updated Tracking number
                cy.get("@finalProjection").then((response) => {
                    cy.searchAnOrderOnSM(req.orderId)
                    cy.validateOrderDetailsOnSM(true)
                })
            })  
        })        
      })
    })
  })
