import { onMyOrderPage } from '../pageObjects/myOrderPage'


// Cypress.Commands.add('placeApiOrder', (shopper, addressSearchBody, searchBody, addItemsBody, creditCardPayment, creditcardSessionHeader,digitalPayment, confirmOrderParameter) => {
//    // const orderPlaced = new CreateB2CDeliveryOrderPaidViaCreditCard()
//     orderPlaced.placeOrderForB2CUser(shopper, addressSearchBody, searchBody, addItemsBody, creditCardPayment, creditcardSessionHeader,
//       digitalPayment, confirmOrderParameter)
//       .then((response) => {
//           //save the order details to verify later
//         const orderId = response.Order.orderId
//         const orderValue = response.Order.orderValue
//         const deliveryDate = response.Order.deliveryDate
//         const orderDate = response.Order.orderDate
//         })

// })

Cypress.Commands.add('navigateToMyOrdersPage', () => {
    onMyOrderPage.getMyAccountButton().click()
    onMyOrderPage.getMyOrdersLink().click()
})