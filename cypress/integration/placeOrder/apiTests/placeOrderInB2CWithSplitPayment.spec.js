/// <reference types="cypress" />

import { fulfilmentType } from '../../../fixtures/checkout/fulfilmentType'
import addressSearchBody from '../../../fixtures/checkout/addressSearch.json'
import creditCardPayment from '../../../fixtures/payment/creditcardPayment.json'
import giftCard from '../../../fixtures/payment/giftCard.json'
import splitPayment from '../../../fixtures/payment/splitCreditGiftCardPayment.json'
import creditcardSessionHeader from '../../../fixtures/payment/creditcardSessionHeader.json'
import confirmOrderParameter from '../../../fixtures/orderConfirmation/confirmOrderParameter.json'
import TestFilter from '../../../support/TestFilter'
import { windowType } from '../../../fixtures/checkout/fulfilmentWindowType.js'
import '../../../support/signUp/api/commands/signUp'
import '../../../support/login/api/commands/login'
import '../../../support/search/api/commands/search'
import '../../../support/fulfilment/api/commands/fulfilment'
import '../../../support/sideCart/api/commands/addItemsToTrolley'
import '../../../support/payment/api/commands/giftCard'
import '../../../support/checkout/api/commands/navigateToCheckout'
import '../../../support/checkout/api/commands/confirmOrder'
import '../../../support/payment/api/commands/creditcard'
import '../../../support/payment/api/commands/digitalPayment'
import '../../../support/logout/api/commands/logout'

TestFilter(['B2C', 'API', 'P0'], () => {
  describe('[API]Place an order on B2C Platform via split payment (Credit Card & Gift Card)', () => {
    before(() => {
      cy.clearCookies({ domain: null })
      cy.clearLocalStorage({ domain: null })
      cy.logOutViaApi()
    })

    it('Should place a split payment order via Credit Card & Gift Card', () => {
      cy.loginWithNewShopperViaApi().then((response)=> {
        cy.validate2FALoginStatus(response, Cypress.env('otpValidationSwitch'), Cypress.env('otpStaticCode'))
      })
        
      cy.setFulfilmentLocationWithWindow(fulfilmentType.DELIVERY, addressSearchBody, windowType.FLEET_DELIVERY)
      cy.addAvailableNonRestrictedPriceLimitedWowItemsToTrolley('Fish', 50.0)

      cy.navigateToCheckout().then((response) => {
        cy.log('Balance To Pay is: ' + response.Model.Order.BalanceToPay)

        splitPayment.payments[0].amount = response.Model.Order.BalanceToPay - 0.01
        splitPayment.payments[1].amount = 0.01
      })

      cy.navigatingToCreditCardIframe().then((response) => {
        creditcardSessionHeader.creditcardSessionId = response.IframeUrl.toString().split('/')[5]
      })

      cy.creditcardPayment(creditCardPayment, creditcardSessionHeader).then((response) => {
        expect(response.status.responseText).to.be.eqls('ACCEPTED')
        
        splitPayment.payments[0].paymentInstrumentId = response.paymentInstrument.itemId
      })

      cy.addGiftCardToAccount(giftCard).then((response) => {
        expect(response.status).to.eq(200)
        
        splitPayment.payments[1].paymentInstrumentId = response.body.GiftCard.PaymentInstrumentId
      })

      cy.digitalPay(splitPayment).then((response) => {
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
})