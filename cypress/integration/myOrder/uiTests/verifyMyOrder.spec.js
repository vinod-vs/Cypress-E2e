/// <reference types="cypress" />

//import shoppers from '../../../fixtures/login/b2cShoppers.json'
//import TestFilter from '../../../support/TestFilter'
import shopper from '../../../fixtures/login/b2cLogin.json'
import searchBody from '../../../fixtures/search/productSearch.json'
import addressSearchBody from '../../../fixtures/checkout/addressSearch.json'
import addItemsBody from '../../../fixtures/sideCart/addItemsToTrolley.json'
import creditCardPayment from '../../../fixtures/payment/creditcardPayment.json'
import digitalPayment from '../../../fixtures/payment/digitalPayment.json'
import creditcardSessionHeader from '../../../fixtures/payment/creditcardSessionHeader.json'
import confirmOrderParameter from '../../../fixtures/orderConfirmation/confirmOrderParameter.json'
import CreateB2CDeliveryOrderPaidViaCreditCard from '../../../support/shared/api/commands/createOrder'
import '../../../support/myOrder/ui/commands/verifyMyOrder'
import '../../../support/login/api/commands/login'
import '../../../support/login/ui/commands/login'
import { onMyOrderPage } from '../../../support/myOrder/ui/pageObjects/myOrderPage'

//TestFilter(['B2C-UI'], () => {
describe('[UI] Verify Order details in MyOrders for order placed for B2C customer', () => {
    before('open application', () => {
  
        cy.clearCookies({ domain: null })
        cy.clearLocalStorage({ domain: null })

    })
    // let myOrderId
    // let myOrderValue
    // let myDeliveryDate
    // let myOrderDate

    it('Place an order via api for B2C customer, then verify the order details in MyOrders UI', () => {
       //Login via api
        cy.loginViaApi(shopper[1])// try this cy.loginWithNewShopperViaApi()
        
        // Place an order via api
        const orderPlaced = new CreateB2CDeliveryOrderPaidViaCreditCard()
        orderPlaced.placeOrderForB2CUser(shopper[1], addressSearchBody, searchBody, addItemsBody, creditCardPayment, creditcardSessionHeader,
          digitalPayment, confirmOrderParameter)
          .then((response) => {
            const orderId = response.Order.orderId
            const orderValue = response.Order.orderValue
            const deliveryDate = response.Order.deliveryDate
            const orderDate = response.Order.orderDate
            // let myOrderId = response.Order.OrderId
            // let myOrderValue = response.Order.TotalIncludingGst
            // let myDeliveryDate = response.Order.DeliveryDate
            // let myOrderDate = response.Order.Createddate
            // cy.log('Before call', orderId, orderValue, deliveryDate, orderDate)
            cy.log(orderId)
            cy.log(orderValue)
            cy.log(deliveryDate)
            cy.log(orderDate)
            // login via UI into same account
            cy.loginViaUi(shopper[1])// try without this
        
            // Navigate to My order page through My account
           // cy.navigateToMyOrdersPage()
           onMyOrderPage.myAccountActions()
            
            //Assert if the order details which we saved earlier is present in the My orders page            
           // cy.verifyMyLatestOrder(orderId, orderValue, deliveryDate, orderDate)
           onMyOrderPage.getMyOrderNumber('140087505')
           onMyOrderPage.getOrderDateString('Sun, 21 November')
           onMyOrderPage.getDeliveryDateString('140087505', 'Sat, 27 November')
           //onMyOrderPage.getOrderTotalString(orderValue)
          
           // onMyOrderPage.getOrderDateString(orderDate).should('contain.text', orderDate)
          // onMyOrderPage.getOrderTotalString(orderValue).should('contain.text', orderValue)
          // onMyOrderPage.getDeliveryDateString(deliveryDate).should('contain.text', deliveryDate)
          //  onMyOrderPage.getTrackMyOrderLink().should('contain.text', ' Track my order ') 
          //  onMyOrderPage.getViewOrderDetailsLink().should('contain.text', 'View order details')
           onMyOrderPage.getTrackMyOrderLink()
           onMyOrderPage.getViewOrderDetailsLink()

            })

      })
  })


//})
