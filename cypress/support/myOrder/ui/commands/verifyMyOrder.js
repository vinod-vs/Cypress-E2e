import { onMyOrderPage } from '../pageObjects/myOrderPage'

Cypress.Commands.add('navigateToMyOrdersPage', () => {
    onMyOrderPage.getMyAccountButton().click()
    onMyOrderPage.getMyOrdersLink().click()
})

Cypress.Commands.add('verifyMyLatestOrder', (orderId, orderValue, deliveryDate, orderDate) => {

  // To Do
  // Need to convert parameter datetime format to be same as UI first.

  // To Do
  // Consider refresh page for a period time until the newly creatd order shows up in my order list.
  // If waiting times out, test failed dues to newly created order doesn't show up on the page.

  onMyOrderPage.getMyOrderNumber().should('contain.text', orderId)
  onMyOrderPage.getOrderDateString().should('contain.text', orderDate)
  onMyOrderPage.getOrderTotalString().should('contain.text', orderValue)
  onMyOrderPage.getDeliveryDateString().should('contain.text', deliveryDate)
  onMyOrderPage.getTrackMyOderLink().should('contain.text', ' Track my order ') 
  onMyOrderPage.getViewOrderDetailsLink().should('contain.text', 'View order details')

})