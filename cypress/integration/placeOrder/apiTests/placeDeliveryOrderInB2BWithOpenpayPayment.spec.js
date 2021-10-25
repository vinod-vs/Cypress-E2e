/// <reference types="cypress" />
/* eslint-disable no-unused-expressions */

import shopper from '../../../fixtures/login/b2bLogin.json'
import searchBody from '../../../fixtures/search/productSearch.json'
import addressSearchBody from '../../../fixtures/checkout/addressSearch.json'
import addItemsBody from '../../../fixtures/sideCart/addItemsToTrolley.json'
import openPayPayment from '../../../fixtures/payment/openPayPayment.json'
import confirmOrderParameter from '../../../fixtures/orderConfirmation/confirmOrderParameter.json'
import purchaseOrderCode from '../../../fixtures/payment/purchaseOrderCode'
import TestFilter from '../../../support/TestFilter'
import { windowType } from '../../../fixtures/checkout/fulfilmentWindowType.js'
import '../../../support/login/api/commands/login'
import '../../../support/search/api/commands/search'
import '../../../support/fulfilment/api/commands/fulfilment'
import '../../../support/sideCart/api/commands/clearTrolley'
import '../../../support/sideCart/api/commands/addItemsToTrolley'
import '../../../support/checkout/api/commands/navigateToCheckout'
import '../../../support/checkout/api/commands/confirmOrder'
import '../../../support/payment/api/commands/creditcard'
import '../../../support/payment/api/commands/digitalPayment'
import '../../../support/payment/api/commands/setPurchaseOrderCode'
import '../../../support/logout/api/commands/logout'

let productStockCode
let productPrice
let supplyLimit

TestFilter(['B2B-API'], () => {
  describe('[API] Place a delivery order on Woolworths at Work website using Openpay', () => {
    before(() => {
      cy.clearCookies({ domain: null })
      cy.clearLocalStorage({ domain: null })
      cy.logOutViaApi()
    })

    it('Should place an order on Woolworths at Work website using OpenPay as payment option', () => {
      cy.loginViaApi(shopper).then((response) => {
        expect(response).to.have.property('LoginResult', 'Success')
      })

      cy.searchDeliveryAddress(addressSearchBody).then((response) => {
        expect(response.Response[0].Id).to.not.be.empty

        expect(response.Response[0].Id).to.not.be.null
      })

      cy.addDeliveryAddress().then((response) => {
        expect(response.Address.AddressId).to.greaterThan(0)

        expect(response.Address.AddressId).to.not.be.null

        expect(response.Address.AreaId).to.greaterThan(0)

        expect(response.Address.AreaId).to.not.be.null

        expect(response.Address.SuburbId).to.greaterThan(0)

        expect(response.Address.SuburbId).to.not.be.null
      })

      cy.getFulfilmentWindowViaApi(windowType.FLEET_DELIVERY).then((response) => {
        expect(response.Id).to.greaterThan(0)
      })

      cy.completeWindowFulfilmentViaApi().then((response) => {
        expect(response).to.have.property('IsSuccessful', true)
      })

      cy.clearTrolley().then((response) => {
        expect(response).to.have.property('TrolleyItemCount', 0)

        expect(response).to.have.property('TotalTrolleyItemQuantity', 0)
      })

      searchBody.SearchTerm = 'Fish'

      cy.productSearch(searchBody).then((response) => {
        expect(response.SearchResultsCount).to.be.greaterThan(0)

        let x

        for (x in response.Products) {
          if (response.Products[x].Products[0].Price !== null &&
                        response.Products[x].Products[0].IsInStock === true &&
                        response.Products[x].Products[0].ProductRestrictionMessage === null &&
                        response.Products[x].Products[0].ProductWarningMessage === null) {
            productStockCode = response.Products[x].Products[0].Stockcode

            productPrice = response.Products[x].Products[0].InstorePrice

            supplyLimit = response.Products[x].Products[0].SupplyLimit

            break
          }
        }

        addItemsBody.StockCode = productStockCode

        if (productPrice >= 3 && supplyLimit >= 10) {
          addItemsBody.Quantity = 10
        } else if (productPrice < 3 && supplyLimit >= 30) {
          addItemsBody.Quantity = 30
        }
      })

      cy.addItemsToTrolley(addItemsBody).then((response) => {
        expect(response.TotalTrolleyItemQuantity).to.be.eqls(addItemsBody.Quantity)

        expect(response.Totals.WoolworthsSubTotal).to.be.greaterThan(0)

        cy.wrap(response.Totals.WoolworthsSubTotal).as('cartSubTotal')
      })

      cy.get('@cartSubTotal').then(cartSubTotal => {
        if (cartSubTotal < 30) {
          searchBody.SearchTerm = 'Bread Rolls'

          cy.productSearch(searchBody).then((response) => {
            expect(response.SearchResultsCount).to.be.greaterThan(0)

            let x

            for (x in response.Products) {
              if (response.Products[x].Products[0].Price !== null && response.Products[x].Products[0].IsInStock === true) {
                productStockCode = response.Products[x].Products[0].Stockcode

                productPrice = response.Products[x].Products[0].InstorePrice

                break
              }
            }
            addItemsBody.StockCode = productStockCode

            if (productPrice >= 3) {
              addItemsBody.Quantity = 10
            } else {
              addItemsBody.Quantity = 30
            }
          })
        }
      })

      cy.navigateToCheckout().then((response) => {
        expect(response.Model.Order.BalanceToPay).to.be.greaterThan(0)

        openPayPayment.openpayAmount = response.Model.Order.BalanceToPay
      })

      cy.setPurchaseOrderCode(purchaseOrderCode).then((response) => {
        expect(response.status).to.eq(200)
      })

      cy.openPayDigitalPay(openPayPayment).then((response) => {
        expect(response.TransactionReceipt).to.not.be.null

        expect(response.PlacedOrderId).to.not.be.null

        confirmOrderParameter.placedOrderId = response.PlacedOrderId
      })

      cy.confirmOrder(confirmOrderParameter).then((response) => {
        expect(response.Order.OrderId).to.eqls(confirmOrderParameter.placedOrderId)

        cy.log('This is the order id: ' + response.Order.OrderId)
      })

      cy.logOutViaApi()
    })
  })
})
