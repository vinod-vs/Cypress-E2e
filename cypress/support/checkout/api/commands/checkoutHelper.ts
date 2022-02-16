import digitalPayment from '../../../../fixtures/payment/digitalPayment.json'
import creditcardSessionHeader from '../../../../fixtures/payment/creditcardSessionHeader.json'
import confirmOrderParameter from '../../../../fixtures/orderConfirmation/confirmOrderParameter.json'
import '../../../../support/checkout/api/commands/navigateToCheckout'
import '../../../../support/payment/api/commands/creditcard'
import '../../../../support/payment/api/commands/digitalPayment'
import '../../../../support/checkout/api/commands/confirmOrder'

Cypress.Commands.add('placeOrderViaApiWithAddedCreditCard', (creditCardDetails: any, platform: string) => {
  cy.navigateToCheckout().then((response: any) => {
    const balanceToPay = response.Model.Order.BalanceToPay
    expect(balanceToPay, 'Balance To Pay').to.be.greaterThan(0)

    digitalPayment.payments[0].amount = balanceToPay

    cy.navigatingToCreditCardIframe().then((response: any) => {
      creditcardSessionHeader.creditcardSessionId = response.IframeUrl.toString().split('/')[5]
    })
  })

  cy.creditcardTokenisation(creditCardDetails, creditcardSessionHeader).then((response: any) => {
    if (platform.toUpperCase() === 'B2C') {
      digitalPayment.payments[0].paymentInstrumentId = response.paymentInstrument.itemId
    } else if (platform.toUpperCase() === 'B2B') {
      digitalPayment.payments[0].paymentInstrumentId = response.itemId
    }
  })

  cy.digitalPay(digitalPayment).then((response: any) => {
    if (response.TransactionReceipt === null || response.PlacedOrderId === null) {
      cy.checkForOrderPlacementErrorsAndThrow(response)
    } else {
      confirmOrderParameter.placedOrderId = response.PlacedOrderId
    }
  })

  cy.confirmOrder(confirmOrderParameter).then((response: any) => {
    cy.log('This is the order id: ' + response.Order.OrderId)

    return cy.wrap(response)
  })
})

Cypress.Commands.add('checkForOrderPlacementErrorsAndThrow', (paymentResponse) => {
  const orderPlacementErrors = paymentResponse.OrderPlacementErrors

  if (orderPlacementErrors !== null) {
    const type = orderPlacementErrors[0].Type
    const message = orderPlacementErrors[0].Message
    throw new Error ('Error on Payment.' + '\n' + 'Type is: ' + type  + '.' + '\n' + 'Message is: ' + message)
  }
})

Cypress.Commands.add('placeOrderViaApiWithPaymentRequest', (paymentRequest) => {
  cy.digitalPay(paymentRequest).then((response: any) => {
    if (response.PaymentResponses !== null) {
      cy.get(response.PaymentResponses).each((instrument: any) => {
        expect(instrument.ErrorDetail, 'Error Status on Payment Instrument Type of ' + instrument.PaymentInstrumentType).to.be.null
      }).then(() => {
        cy.checkForOrderPlacementErrorsAndThrow(response).then(() => {
          expect(response.TransactionReceipt, 'Payment Transaction Receipt').to.not.be.null
          expect(response.PlacedOrderId, 'Order Placement Id').to.not.be.null
            
          confirmOrderParameter.placedOrderId = response.PlacedOrderId 
        })
      })
    } else {
      cy.checkForOrderPlacementErrorsAndThrow(response)
    }       
  })

  cy.confirmOrder(confirmOrderParameter).then((response: any) => {
    const orderId = response.Order.OrderId
    expect(orderId, 'Order Placement Id').to.eqls(confirmOrderParameter.placedOrderId)

    cy.log('This is the order id: ' + response.Order.OrderId)
    
    return cy.wrap(orderId)
  })
}) 
