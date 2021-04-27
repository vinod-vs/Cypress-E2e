/// <reference types="cypress" />
/* eslint-disable no-unused-expressions */

import shopper from '../../../fixtures/login/login.json'
import searchBody from '../../../fixtures/search/productSearch.json'
import addressSearchBody from '../../../fixtures/checkout/addressSearch.json'
import addItemsBody from '../../../fixtures/sideCart/addItemsToTrolley.json'
import creditCardPayment from '../../../fixtures/payment/creditcardPayment.json'
import digitalPayment from '../../../fixtures/payment/digitalPayment.json'
import creditcardSessionHeader from '../../../fixtures/payment/creditcardSessionHeader.json'
import confirmOrderParameter from '../../../fixtures/orderConfirmation/confirmOrderParameter.json'
import '../../../support/login/api/commands/login'
import '../../../support/search/api/commands/search'
import '../../../support/deliveryDateAndWindow/api/commands/deliveryDateAndWindow'
import '../../../support/sideCart/api/commands/clearTrolley'
import '../../../support/sideCart/api/commands/addItemsToTrolley'
import '../../../support/checkout/api/commands/navigateToCheckout'
import '../../../support/checkout/api/commands/confirmOrder'
import '../../../support/payment/api/commands/creditcard'
import '../../../support/payment/api/commands/digitalPayment'

let productStockCode

describe('Place an Order using Credit Card', () => {
  before(() => {
    cy.clearCookies({ domain: null })
    cy.clearLocalStorage({ domain: null })
  })

  it('Should place an order using credit card', () => {
    cy.loginViaApi(shopper.b2c).then((response) => {
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

    cy.deliveryTimeSlot().then((response) => {
      expect(response).to.have.length.greaterThan(0)
    })

    cy.fulfilment().then((response) => {
      expect(response).to.have.property('IsSuccessful', true)
    })

    cy.clearTrolley().then((response) => {
      expect(response).to.have.property('TrolleyItemCount', 0)

      expect(response).to.have.property('TotalTrolleyItemQuantity', 0)
    })

    searchBody.SearchTerm = 'coffee'

    cy.productSearch(searchBody).then((response) => {
      expect(response.SearchResultsCount).to.be.greaterThan(0)

      let x

      for (x in response.Products) {
        if (response.Products[x].Products[0].Price !== null) {
          productStockCode = response.Products[x].Products[0].Stockcode

          break
        }
      }
      addItemsBody.StockCode = productStockCode

      addItemsBody.Quantity = 10
    })

    cy.addItemsToTrolley(addItemsBody).then((response) => {
      expect(response.TotalTrolleyItemQuantity).to.be.eqls(10)

      expect(response.Totals.WoolworthsSubTotal).to.be.greaterThan(0)
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

    cy.confirmOrder(confirmOrderParameter).then((response) => {
      expect(response.Order.OrderId).to.eqls(confirmOrderParameter.placedOrderId)

      cy.log('This is the order id: ' + response.Order.OrderId)
    })
  })
})
