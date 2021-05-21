import '../../../login/api/commands/login'
import '../../../search/api/commands/search'
import '../../../deliveryDateAndWindow/api/commands/deliveryDateAndWindow'
import '../../../sideCart/api/commands/clearTrolley'
import '../../../sideCart/api/commands/addItemsToTrolley'
import '../../../checkout/api/commands/navigateToCheckout'
import '../../../checkout/api/commands/confirmOrder'
import '../../../payment/api/commands/creditcard'
import '../../../payment/api/commands/digitalPayment'


export default class createOrder {
  placeOrderForB2CUser(shopper, addressSearchBody, searchBody, addItemsBody, creditCardPayment, creditcardSessionHeader,
    digitalPayment,confirmOrderParameter) {
      let productStockCode
        searchBody.SearchTerm = 'cake'
        return cy.loginViaApi(shopper)        
        .then((response) => {
          expect(response).to.have.property('LoginResult', 'Success')
        }).then(() => { 
          return  cy.searchDeliveryAddress(addressSearchBody).then(() => {
            cy.addDeliveryAddress().then(() => { 
              cy.deliveryTimeSlot().then(() => {
                cy.fulfilment().then(() => {
                  cy.clearTrolley().then(() => {
                     return cy.productSearch(searchBody).then((response) => {
                      let x

                      for (x in response.Products) {
                      if (response.Products[x].Products[0].Price !== null && response.Products[x].Products[0].IsInStock === true) {
                      productStockCode = response.Products[x].Products[0].Stockcode
                      break
                    }
                  }
                  addItemsBody.StockCode = productStockCode
                  addItemsBody.Quantity = 10
                  }).then(() => {
                    return cy.addItemsToTrolley(addItemsBody).then(() => {
                         cy.navigateToCheckout().then((response) => {
                          digitalPayment.payments[0].amount = response.Model.Order.BalanceToPay                          
                           cy.navigatingToCreditCardIframe().then((response) => {
                            creditcardSessionHeader.creditcardSessionId = response.IframeUrl.toString().split('/')[5]                            
                          }).then(() => {                            
                             cy.creditcardPayment(creditCardPayment, creditcardSessionHeader).then((response) => {
                              digitalPayment.payments[0].paymentInstrumentId = response.itemId                               
                            }).then(() => {                              
                              cy.digitalPay(digitalPayment).then((response) => {
                                confirmOrderParameter.placedOrderId = response.PlacedOrderId                                
                              }).then(() => {
                                cy.confirmOrder(confirmOrderParameter).then((response) => {                                                                    
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
    })
  }
}

