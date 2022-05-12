/// <reference types="cypress" />

import TestFilter from '../../../support/TestFilter'
import b2bShopper from '../../../fixtures/login/b2bLogin.json'
import searchBody from '../../../fixtures/search/productSearch.json'
import addressSearchBody from '../../../fixtures/checkout/addressSearch.json'
import addItemsBody from '../../../fixtures/sideCart/addItemsToTrolley.json'
import creditCardPayment from '../../../fixtures/payment/creditcardPayment.json'
import digitalPayment from '../../../fixtures/payment/digitalPayment.json'
import creditcardSessionHeader from '../../../fixtures/payment/creditcardSessionHeader.json'
import confirmOrderParameter from '../../../fixtures/orderConfirmation/confirmOrderParameter.json'
import CreateB2CDeliveryOrderPaidViaCreditCard from '../../../support/shared/api/commands/createOrder'
import '../../../support/orders/api/commands/cancelOrder'

TestFilter(['B2B', 'API', 'P0'], () => {
  describe.skip('[API] Amend placed order for B2B customer', () => {
    beforeEach(() => {
      cy.clearCookies({ domain: null })
      cy.clearLocalStorage({ domain: null })
    })

    it('Place an order for B2B customer, then amend the order', () => {
      const orderPlaced = new CreateB2CDeliveryOrderPaidViaCreditCard()
      orderPlaced.placeOrderForB2BUser(b2bShopper, addressSearchBody, searchBody, addItemsBody, creditCardPayment, creditcardSessionHeader,
        digitalPayment, confirmOrderParameter)
        .then((response) => {
          const orderId = response.Order.OrderId
          // RC 28/04/22: amendOrder cmd now verifies amend success status
          cy.amendOrder(orderId)
        })
    })
  })
})
