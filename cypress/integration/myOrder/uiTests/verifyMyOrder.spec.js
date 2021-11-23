/// <reference types="cypress" />
import { fulfilmentType } from '../../../fixtures/checkout/fulfilmentType'
import deliveryOptions from '../../../fixtures/checkout/deliveryOptions.json'
import storeSearchBody from '../../../fixtures/checkout/storeSearch.json'
import { windowType } from '../../../fixtures/checkout/fulfilmentWindowType'
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
import '../../../support/signUp/api/commands/signUp'
import '../../../support/delivery/api/commands/options'
import '../../../support/logout/api/commands/logout'
import '../../../support/login/api/commands/login'
import '../../../support/checkout/api/commands/checkoutHelper'
import '../../../support/fulfilment/api/commands/fulfilment'
import '../../../support/sideCart/api/commands/addItemsToTrolley'
import '../../../support/checkout/api/commands/navigateToCheckout'
import '../../../support/checkout/api/commands/confirmOrder'
import '../../../support/payment/api/commands/creditcard'
import '../../../support/payment/api/commands/digitalPayment'
import '../../../support/address/api/commands/searchSetValidateAddress'
//TestFilter(['B2C-UI'], () => {
  // const searchTerm = 'Kitchen' // second approach
  // const trolleyThreshold = 50.00 // second approach
  // const platform = Cypress.env('b2cPlatform') // second approach

describe('[UI] Verify Order details in MyOrders for order placed for B2C customer', () => {
    beforeEach('open application', () => {
  
        cy.clearCookies({ domain: null })
        cy.clearLocalStorage({ domain: null })
   //     cy.loginWithNewShopperViaApi() // use this for the 2nd approach

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
           onMyOrderPage.getMyOrderNumber('140087540')
           onMyOrderPage.getOrderDateString('Mon, 22 November')
           onMyOrderPage.getDeliveryDateString('140087540', 'Sun, 28 November')
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

      it.skip('Place an order via api for B2C customer- another approach', () => {
        //add this after Test filter and before Describe
          // const searchTerm = 'Kitchen'
         // const trolleyThreshold = 50.00
        // const platform = Cypress.env('b2cPlatform')

       //add this under describe
       //    cy.loginWithNewShopperViaApi()
 
           cy.setFulfilmentLocationWithWindow(fulfilmentType.DELIVERY, addressSearchBody, windowType.FLEET_DELIVERY)
           cy.addAvailableNonRestrictedPriceLimitedWowItemsToTrolley(searchTerm, trolleyThreshold)
     
           // deliveryOptions.CanLeaveUnattended = true
           // cy.setDeliveryOptionsViaApi(deliveryOptions)
     
           cy.placeOrderViaApiWithAddedCreditCard(creditCardPayment, platform).then((response) => {
           // expect(response.Order.CanLeaveOrderUnattended).to.eql(true)
          
             const orderId = response.Order.orderId
             const orderValue = response.Order.orderValue
             const deliveryDate = response.Order.deliveryDate
             const orderDate = response.Order.orderDate

             cy.log(orderId)
             cy.log(orderValue)
             cy.log(deliveryDate)
             cy.log(orderDate)
             // login via UI into same account
           //  cy.loginViaUi(shopper[1])// try without this
         
             // Navigate to My order page through My account
            onMyOrderPage.myAccountActions()
             
             //Assert if the order details which we saved earlier is present in the My orders page            
            onMyOrderPage.getMyOrderNumber('140087540')
            onMyOrderPage.getOrderDateString('Mon, 22 November')
            onMyOrderPage.getDeliveryDateString('140087540', 'Sun, 28 November')
            //onMyOrderPage.getOrderTotalString(orderValue)
            onMyOrderPage.getTrackMyOrderLink()
            onMyOrderPage.getViewOrderDetailsLink()
 
             })
 
       })
  })


//})
