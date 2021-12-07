/// <reference types="cypress" />
/* eslint-disable no-unused-expressions */

import shoppers from '../../../fixtures/login/b2bShoppers.json'
import searchBody from '../../../fixtures/search/productSearch.json'
import addressSearchBody from '../../../fixtures/checkout/addressSearch.json'
import addItemsBody from '../../../fixtures/sideCart/addItemsToTrolley.json'
import openPayPayment from '../../../fixtures/payment/openPayPayment.json'
import confirmOrderParameter from '../../../fixtures/orderConfirmation/confirmOrderParameter.json'
import purchaseOrderCode from '../../../fixtures/payment/purchaseOrderCode.json'
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

let productStockCode
let productPrice
let supplyLimit

TestFilter(['B2B', 'API', 'P0'], () => {
  describe('[API] Place a delivery order on Woolworths at Work website using Openpay', () => {
    before(() => {
      cy.clearCookies({ domain: null })
      cy.clearLocalStorage({ domain: null })
    })

    it('Should place an order on Woolworths at Work website using OpenPay as payment option', () => {
      cy.loginViaApi(shoppers[3]).then((response: any) => {
        expect(response).to.have.property('LoginResult', 'Success')
      })

      cy.searchDeliveryAddress(addressSearchBody).then((response: any) => {
        expect(response.Response[0].Id).to.not.be.empty

        expect(response.Response[0].Id).to.not.be.null
      })

      cy.addDeliveryAddress().then((response: any) => {
        expect(response.Address.AddressId).to.greaterThan(0)

        expect(response.Address.AddressId).to.not.be.null

        expect(response.Address.AreaId).to.greaterThan(0)

        expect(response.Address.AreaId).to.not.be.null

        expect(response.Address.SuburbId).to.greaterThan(0)

        expect(response.Address.SuburbId).to.not.be.null
      })

      cy.getFulfilmentWindowViaApi(windowType.FLEET_DELIVERY).then((response: any) => {
        expect(response.Id).to.greaterThan(0)
      })

      cy.completeWindowFulfilmentViaApi().then((response: any) => {
        expect(response).to.have.property('IsSuccessful', true)
      })

      cy.clearTrolley().then((response: any) => {
        expect(response).to.have.property('TrolleyItemCount', 0)

        expect(response).to.have.property('TotalTrolleyItemQuantity', 0)
      })

      cy.addAvailableNonRestrictedPriceLimitedWowItemsToTrolley('fish', 30.0)

      cy.navigateToCheckout().then((response: any) => {
        expect(response.Model.Order.BalanceToPay).to.be.greaterThan(0)

        openPayPayment.openpayAmount = response.Model.Order.BalanceToPay
      })

      cy.setPurchaseOrderCode(purchaseOrderCode).then((response: any) => {
        expect(response.status).to.eq(200)
      })

      cy.openPayDigitalPay(openPayPayment).then((response: any) => {
        expect(response.TransactionReceipt).to.not.be.null

        expect(response.PlacedOrderId).to.not.be.null

        confirmOrderParameter.placedOrderId = response.PlacedOrderId
      })

      cy.confirmOrder(confirmOrderParameter).then((response: any) => {
        expect(response.Order.OrderId).to.eqls(confirmOrderParameter.placedOrderId)

        cy.log('This is the order id: ' + response.Order.OrderId)
      })
    })
  })
})
