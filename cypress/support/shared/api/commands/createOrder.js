import '../../../login/api/commands/login'
import '../../../search/api/commands/search'
import '../../../fulfilment/api/commands/fulfilment'
import '../../../sideCart/api/commands/clearTrolley'
import '../../../sideCart/api/commands/addItemsToTrolley'
import '../../../checkout/api/commands/navigateToCheckout'
import '../../../checkout/api/commands/confirmOrder'
import '../../../payment/api/commands/creditcard'
import '../../../payment/api/commands/digitalPayment'
import { windowType } from '../../../../fixtures/checkout/fulfilmentWindowType.js'

export default class CreateB2CDeliveryOrderPaidViaCreditCard {
  placeOrderForB2CUser (shopper, addressSearchBody, searchBody, addItemsBody, creditCardPayment, creditcardSessionHeader,
    digitalPayment, confirmOrderParameter) {
    let productStockCode
    searchBody.SearchTerm = 'Health & Beauty'
    return cy.loginViaApi(shopper)
      .then((response) => {
        cy.validate2FALoginStatus(response, Cypress.env('otpValidationSwitch'), Cypress.env('otpStaticCode'))
             
        return cy.searchDeliveryAddress(addressSearchBody).then(() => {
          cy.addDeliveryAddress().then(() => {
            cy.getFulfilmentWindowViaApi(windowType.FLEET_DELIVERY).then(() => {
              cy.completeWindowFulfilmentViaApi().then(() => {
                cy.clearTrolley().then(() => {
                  return cy.productSearch(searchBody).then((response) => {
                    let x

                    for (x in response.Products) {
                      if (response.Products[x].Products[0].Price !== null &&
                          response.Products[x].Products[0].IsInStock === true &&
                          response.Products[x].Products[0].ProductRestrictionMessage === null &&
                          response.Products[x].Products[0].Price >= 10 &&
                          response.Products[x].Products[0].SupplyLimit >= 5 &&
                          response.Products[x].Products[0].ProductWarningMessage === null) { productStockCode = response.Products[x].Products[0].Stockcode }                                
                    }

                    addItemsBody.StockCode = productStockCode
                    addItemsBody.Quantity = 10
                  }).then(() => {
                    cy.log(JSON.stringify(addItemsBody))
                    return cy.addItemsToTrolley(addItemsBody).then((response) => {
                      expect(response.Totals.WoolworthsSubTotal).to.be.greaterThan(0)
                      cy.navigateToCheckout().then((response) => {
                        digitalPayment.payments[0].amount = response.Model.Order.BalanceToPay
                        cy.log('Balance to pay',response.Model.Order.BalanceToPay)
                        cy.navigatingToCreditCardIframe().then((response) => {
                          creditcardSessionHeader.creditcardSessionId = response.IframeUrl.toString().split('/')[5]
                        }).then(() => {
                          cy.creditcardTokenisation(creditCardPayment, creditcardSessionHeader).then((response) => {
                            digitalPayment.payments[0].paymentInstrumentId = response.itemId
                          }).then(() => {
                            cy.digitalPay(digitalPayment).then((response) => {
                              confirmOrderParameter.placedOrderId = response.PlacedOrderId
                              expect(response.PlacedOrderId).to.not.be.null
                            }).then(() => {
                              cy.confirmOrder(confirmOrderParameter).then((response) => {})
                            })
                          })
                        })
                      })
                    })
                  })
                })
              })
            })
          })
        })
      })
  }
}
