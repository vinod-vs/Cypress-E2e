/// <reference types="Cypress" />

import shoppers from '../../../fixtures/login/b2cShoppers.json'
import { myOrderPage, onMyOrderPage } from '../../../support/myOrder/ui/myOrderPage'
import '../../../support/login/api/commands/login'
import '../../../support/login/ui/commands/login'
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
import '../../../support/checkout/api/commands/checkoutHelper'

//TestFilter(['B2C-UI'], () => {
describe('[UI] Verify Order details in MyOrders for order placed for B2C customer', () => {
    before('open application', () => {
  
        cy.clearCookies({ domain: null })
        cy.clearLocalStorage({ domain: null })

    })

    it('Place an order via api for B2C customer, then verify the order details in MyOrders UI', () => {
        cy.loginViaApi(shopper[1])
        const orderPlaced = new CreateB2CDeliveryOrderPaidViaCreditCard()
        orderPlaced.placeOrderForB2CUser(shopper[1], addressSearchBody, searchBody, addItemsBody, creditCardPayment, creditcardSessionHeader,
          digitalPayment, confirmOrderParameter)
          .then((response) => {
            const orderId = response.Order.OrderId
            })
            cy.loginViaUi(shopper[1])
            onMyOrderPage.getMyAccountButton()
            onMyOrderPage.getMyOrdersLink()
            //Assert if the order number which we saved earlier is present in the My orders page
            // Verify the Delivery date, 
            //verify delivery total
            //verify Track my order link
            //verify 'view order details' link 
          })

      })


//})
