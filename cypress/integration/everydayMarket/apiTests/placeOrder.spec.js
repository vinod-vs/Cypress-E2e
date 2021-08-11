/// <reference types="cypress" />
/* eslint-disable no-unused-expressions */

import shoppers from '../../../fixtures/everydayMarket/shoppers.json'
import searchBody from '../../../fixtures/search/productSearch.json'
import addressSearchBody from '../../../fixtures/checkout/addressSearch.json'
import addItemsBodyWow from '../../../fixtures/sideCart/addItemsToTrolley.json'
import addItemsBodyMp from '../../../fixtures/sideCart/addItemsToTrolley1.json'
// import {addItemsBodyWow, addItemsBodyMp} from '../../../fixtures/sideCart/addItemsToTrolley.json'
import creditCardPayment from '../../../fixtures/payment/creditcardPayment.json'
import digitalPayment from '../../../fixtures/payment/digitalPayment.json'
import creditcardSessionHeader from '../../../fixtures/payment/creditcardSessionHeader.json'
import confirmOrderParameter from '../../../fixtures/orderConfirmation/confirmOrderParameter.json'
import TestFilter from '../../../support/TestFilter'
import '../../../support/login/api/commands/login'
import '../../../support/search/api/commands/search'
import '../../../support/deliveryDateAndWindow/api/commands/deliveryDateAndWindow'
import '../../../support/sideCart/api/commands/clearTrolley'
import '../../../support/sideCart/api/commands/addItemsToTrolley'
import '../../../support/checkout/api/commands/navigateToCheckout'
import '../../../support/checkout/api/commands/confirmOrder'
import '../../../support/payment/api/commands/creditcard'
import '../../../support/payment/api/commands/digitalPayment'
import '../../../support/everydayMarket/api/commands/orderApi'
import '../../../support/everydayMarket/api/commands/marketplacer'

TestFilter(['API'], () => {
  describe('[API] Place an order with WOW and MP items', () => {
    before(() => {
      cy.clearCookies({ domain: null })
      cy.clearLocalStorage({ domain: null })
    })

    it('Place an order using credit card', () => {

      let addressId
      let deliveryAddressId
      let deliveryAreaId
      let deliverySuburbId
      let timeSlotId
      let windowDate

      cy.loginViaApi(shoppers.emAccount2).then((response) => {
        expect(response).to.have.property('LoginResult', 'Success')
      })

      cy.searchDeliveryAddress(addressSearchBody).then((response) => {
        expect(response.Response[0].Id).to.not.be.empty
        expect(response.Response[0].Id).to.not.be.null
        addressId = response.Response[0].Id
        cy.log('addressId: ' + addressId)

        cy.addDeliveryAddressForAddressId(addressId).then((response) => {
          expect(response.Address.AddressId).to.greaterThan(0)
          expect(response.Address.AddressId).to.not.be.null
          expect(response.Address.AreaId).to.greaterThan(0)
          expect(response.Address.AreaId).to.not.be.null
          expect(response.Address.SuburbId).to.greaterThan(0)
          expect(response.Address.SuburbId).to.not.be.null
          deliveryAddressId = response.Address.AddressId
          deliveryAreaId = response.Address.AreaId
          deliverySuburbId = response.Address.SuburbId
          cy.log('deliveryAddressId: ' + deliveryAddressId + ", deliveryAreaId: " + deliveryAreaId + ", deliverySuburbId: " + deliverySuburbId)

          cy.deliveryTimeSlotForAddress(deliveryAddressId, deliveryAreaId, deliverySuburbId).then((response) => {
            expect(response).to.have.length.greaterThan(0)
    
            let x, y
            for (x in response) {
              let found = false
              if (response[x].Available === true) {
                cy.log(response[x].AbsoluteDateText + " AVAILABLE FOR DELIVERY")
                let y
                for (y in response[x].Times) {
                  if (response[x].Times[y].Available === true &&
                    response[x].Times[y].IsReserved === false &&
                    response[x].Times[y].IsExpress === false &&
                    response[x].Times[y].IsKeptOpenForRewardsPlus === false &&
                    response[x].Times[y].EligibleForDeliverySaver === false &&
                    response[x].Times[y].IsCrowdSourced === false &&
                    response[x].Times[y].IsExclusive === false &&
                    response[x].Times[y].IsEcoWindow === false) {
                    timeSlotId = response[x].Times[y].Id
                    windowDate = response[x].Date
                    cy.log(response[x].Times[y].TimeWindow + " IS A REGULAR AVAILABLE SLOT")
                    found = true
                    break
                  } else {
                    cy.log(response[x].Times[y].TimeWindow + " IS A REGULAR NON-AVAILABLE SLOT")
                  }
                }
              } else {
                cy.log(response[x].AbsoluteDateText + " NOT AVAILABLE FOR DELIVERY")
              }
              if(found === true)
              break
            }
            cy.log('deliveryTimeSlotForAddress: timeSlotId: ' + timeSlotId + ", windowDate: " + windowDate)

            cy.fulfilmentWithSpecificDeliveryDateAndTime(deliveryAddressId, timeSlotId, windowDate).then((response) => {
              expect(response).to.have.property('IsSuccessful', true)
              expect(response).to.have.property('IsNonServiced', false)
            })
          })            
        })        
      })

      cy.clearTrolley().then((response) => {
        expect(response).to.have.property('TrolleyItemCount', 0)
        expect(response).to.have.property('TotalTrolleyItemQuantity', 0)
      })

      const searchTerm = 'treats'
      let wowStockCode = 0
      let wowQuantity = 0
      let mpStockCode = 0
      const mpQuantity = 2
      const minWowOrderThreshold = 50
      const bufferWowQuantity = 5
      searchBody.SearchTerm = searchTerm

      cy.productSearch(searchBody).then((response) => {
        expect(response.SearchResultsCount).to.be.greaterThan(0)

        let x
        for (x in response.Products) {
          if (response.Products[x].Products[0].Price !== null &&
            response.Products[x].Products[0].IsInStock === true &&
            response.Products[x].Products[0].IsMarketProduct === false &&
            response.Products[x].Products[0].SupplyLimit >= 50) {
            wowQuantity = minWowOrderThreshold/response.Products[x].Products[0].Price
            wowQuantity = Math.floor(wowQuantity) + bufferWowQuantity
            cy.log("Calculated wowQuantity: " + wowQuantity)
          if (response.Products[x].Products[0].Price !== null &&
            response.Products[x].Products[0].IsInStock === true &&
            response.Products[x].Products[0].IsMarketProduct === false &&
            response.Products[x].Products[0].SupplyLimit >= wowQuantity) {
            wowStockCode = response.Products[x].Products[0].Stockcode
            cy.log('WOWProduct: ' + wowStockCode + ' , SupplyLimit: ' + response.Products[x].Products[0].SupplyLimit + ' , PerItemPrice: ' + response.Products[x].Products[0].Price + ' , Quantity: ' + wowQuantity)
            addItemsBodyWow.StockCode = wowStockCode
            addItemsBodyWow.Quantity = wowQuantity

            cy.log('Adding WOW Item to Cart. Stockcode: ' + wowStockCode + ' , of quantity: ' + wowQuantity)
            cy.addItemsToTrolley(addItemsBodyWow).then((response) => {
              expect(response.TotalTrolleyItemQuantity).to.be.eqls(wowQuantity)
              expect(response.Totals.WoolworthsSubTotal).to.be.greaterThan(0)
              expect(response.Totals.MarketSubTotal).to.be.equal(0)
            })
            break
          }
        }
        }

        cy.wait(Cypress.config('twoSecondWait'))

        for (x in response.Products) {
          if (response.Products[x].Products[0].Price !== null &&
            response.Products[x].Products[0].IsInStock === true &&
            response.Products[x].Products[0].IsMarketProduct === true &&
            response.Products[x].Products[0].SupplyLimit >= mpQuantity) {
            mpStockCode = response.Products[x].Products[0].Stockcode
            cy.log('MarketProduct: ' + mpStockCode + ' , SupplyLimit: ' + response.Products[x].Products[0].SupplyLimit + ' , PerItemPrice: ' + response.Products[x].Products[0].Price + ' , Quantity: ' + mpQuantity)
            addItemsBodyMp.StockCode = mpStockCode
            addItemsBodyMp.Quantity = mpQuantity

            cy.log('Adding MP Item to Cart. Stockcode: ' + mpStockCode + ' , of quantity: ' + mpQuantity)
            cy.addItemsToTrolley(addItemsBodyMp).then((response) => {
              expect(response.TotalTrolleyItemQuantity).to.be.eqls(mpQuantity + wowQuantity)
              expect(response.Totals.WoolworthsSubTotal).to.be.greaterThan(0)
              expect(response.Totals.MarketSubTotal).to.be.greaterThan(0)
            })
            break
          }
        }
        expect(wowStockCode).to.be.greaterThan(0)
        expect(mpStockCode).to.be.greaterThan(0)        
      })

      cy.navigateToCheckout().then((response) => {
        expect(response.Model.Order.BalanceToPay).to.be.greaterThan(0)
        digitalPayment.payments[0].amount = response.Model.Order.BalanceToPay
      })

      cy.navigatingToCreditCardIframe().then((response) => {
        expect(response).to.have.property('Success', true)
        creditcardSessionHeader.creditcardSessionId = response.IframeUrl.toString().split('/')[5]
      })

      cy.creditcardPayment(creditCardPayment, creditcardSessionHeader).then((response) => {
        expect(response.status.responseText).to.be.eqls('ACCEPTED')
        digitalPayment.payments[0].paymentInstrumentId = response.itemId
      })

      cy.digitalPay(digitalPayment).then((response) => {
        expect(response.TransactionReceipt).to.not.be.null
        expect(response.PlacedOrderId).to.not.be.null
        confirmOrderParameter.placedOrderId = response.PlacedOrderId
      })

      let orderId
      let orderReference
      let mpInvoiceId
      const shopperId = shoppers.emAccount2.shopperId
      cy.wait(Cypress.config('fiveSecondWait'))
      cy.confirmOrder(confirmOrderParameter).then((response) => {
        expect(response.Order.OrderId).to.eqls(confirmOrderParameter.placedOrderId)
        orderId = response.Order.OrderId.toString()
        orderReference = response.Order.OrderReference.toString()
        cy.log('This is the order id: ' + response.Order.OrderId)
        cy.log('This is the order ref: ' + response.Order.OrderReference)

        cy.wait(Cypress.config('tenSecondWait')*3)
        cy.ordersApiByShopperIdAndTraderOrderId(shopperId, orderId).then((response) => {
          mpInvoiceId = response.invoices[0].legacyIdFormatted
          cy.log('This is the MPInvoice Id: ' + mpInvoiceId)
          verifyOrderDetails(response, orderId, orderReference, mpInvoiceId, shopperId, mpQuantity, mpStockCode)

          cy.ordersByInvoice(mpInvoiceId).then((response) => {
            verifyOrderDetails(response, orderId, orderReference, mpInvoiceId, shopperId, mpQuantity, mpStockCode)
          })
        })

        cy.wait(Cypress.config('twoSecondWait'))
        cy.events(shopperId, orderId, orderReference).then((response) => {
          verifyEventDetails(response, orderId, orderReference, mpInvoiceId, shopperId, mpQuantity, mpStockCode)
        })
      })
    })
  })
})

function verifyEventDetails(response, orderId, orderReference, mpInvoiceId, shopperId, quantity, stockCode) {
  // Verify OrderPlaced event contents
  expect(response.data[0].orderId).to.equal(Number(orderId))
  expect(response.data[0].orderReference).to.be.equal(orderReference)
  expect(response.data[0].shopperId).to.be.equal(Number(shopperId))
  expect(response.data[0].domainEvent).to.be.equal('OrderPlaced')
  expect(response.data[0].payload).to.not.be.null
  // Verify MarketOrderPlaced event contents
  expect(response.data[1].orderId).to.equal(Number(orderId))
  expect(response.data[1].orderReference).to.be.equal(orderReference)
  expect(response.data[1].shopperId).to.be.equal(Number(shopperId))
  expect(response.data[1].domainEvent).to.be.equal('MarketOrderPlaced')
  expect(response.data[1].payload).to.not.be.null
}
function verifyOrderDetails(response, orderId, orderReference, mpInvoiceId, shopperId, quantity, stockCode) {
  // Order details
  expect(response.orderId).to.equal(Number(orderId))
  expect(response.orderReference).to.be.equal(orderReference)
  expect(response.shopperId).to.be.equal(Number(shopperId))
  expect(response.orderStatus).to.be.equal('Placed')
  expect(response.thirdPartyOrderId).to.not.be.null
  expect(response.thirdPartyName).to.be.equal('Marketplacer')
  expect(response.createdTimeStampUtc).to.not.be.null
  expect(response.shippingPdfLink).to.not.be.null
  expect(response.invoices.length).to.be.equal(1)
  // Invoice details
  expect(response.invoices[0].invoiceStatus).to.be.equal('PAID')
  expect(response.invoices[0].seller.sellerId).to.not.be.null
  expect(response.invoices[0].seller.sellerName).to.not.be.null
  expect(response.invoices[0].shipments.length).to.be.equal(0)
  expect(response.invoices[0].lineItems.length).to.be.equal(1)
  expect(response.invoices[0].legacyId).to.not.be.null
  expect(response.invoices[0].legacyIdFormatted).to.not.be.null
  expect(response.invoices[0].invoiceTotal).to.be.greaterThan(0)
  expect(response.invoices[0].updatedTimeStampUtc).to.not.be.null
  expect(response.invoices[0].refunds.length).to.be.equal(0)
  expect(response.invoices[0].orderTrackingStatus).to.be.equal('Received')
  expect(response.invoices[0].pdfLink).to.not.be.null
  expect(response.invoices[0].legacyIdFormatted).to.be.equal(mpInvoiceId)
  // Line item details
  expect(response.invoices[0].lineItems[0].lineItemId).to.not.be.null
  expect(response.invoices[0].lineItems[0].legacyId).to.not.be.null
  expect(response.invoices[0].lineItems[0].stockCode).to.be.equal(Number(stockCode))
  expect(response.invoices[0].lineItems[0].quantity).to.be.equal(Number(quantity))
  expect(response.invoices[0].lineItems[0].salePrice).to.be.greaterThan(0)
  expect(response.invoices[0].lineItems[0].variantId).to.not.be.null
  //expect(response.invoices[0].lineItems[0].status).to.be.equal('ALLOCATED')
}
