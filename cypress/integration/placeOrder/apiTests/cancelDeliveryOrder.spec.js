/// <reference types="cypress" />
/* eslint-disable no-unused-expressions */

import TestFilter from '../../../support/TestFilter'
import shopper from '../../../fixtures/login/b2cLogin.json'
import searchBody from '../../../fixtures/search/productSearch.json'
import addressSearchBody from '../../../fixtures/checkout/addressSearch.json'
import addItemsBody from '../../../fixtures/sideCart/addItemsToTrolley.json'
import creditCardPayment from '../../../fixtures/payment/creditcardPayment.json'
import digitalPayment from '../../../fixtures/payment/digitalPayment.json'
import creditcardSessionHeader from '../../../fixtures/payment/creditcardSessionHeader.json'
import confirmOrderParameter from '../../../fixtures/orderConfirmation/confirmOrderParameter.json'
import CreateB2CDeliveryOrderPaidViaCreditCard from '../../../support/shared/api/commands/createOrder'
import '../../../support/orders/api/commands/cancelOrder'

TestFilter(['B2C', 'API', 'P0'], () => {
  describe('[API] Cancel placed order for B2C customer', () => {
    beforeEach(() => {
      cy.clearCookies({ domain: null })
      cy.clearLocalStorage({ domain: null })
    })

    it('Place an order for B2C customer, then cancel the order', () => {
      const orderPlaced = new CreateB2CDeliveryOrderPaidViaCreditCard()
      orderPlaced.placeOrderForB2CUser(shopper, addressSearchBody, searchBody, addItemsBody, creditCardPayment, creditcardSessionHeader,
        digitalPayment, confirmOrderParameter)
        .then((response) => {
          const orderId = response.Order.OrderId
          cy.cancelOrder(orderId).then((response) => {
            expect(response.status).to.eq(200)
          })
        })
    })
  })
})
