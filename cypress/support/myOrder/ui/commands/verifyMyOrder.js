import { onMyOrderPage } from '../pageObjects/myOrderPage'

Cypress.Commands.add('navigateToMyOrdersPage', () => {
    onMyOrderPage.getMyAccountButton().click()
    onMyOrderPage.getMyOrdersLink().click()
})

Cypress.Commands.add('verifyMyLatestOrder', (orderId, orderValue, deliveryDate, orderDate) => {
    cy.log(orderId)
    cy.log(orderValue)
    cy.log(deliveryDate)
    cy.log(orderDate)
  onMyOrderPage.getMyOrderNumber().should('contain.text', orderId)
 // onMyOrderPage.getOrderDateString().should('contain.text', orderDate)
 // onMyOrderPage.getOrderTotalString().should('contain.text', orderValue)

 // onMyOrderPage.getDeliveryDateString().should('contain.text', deliveryDate)
  onMyOrderPage.getTrackMyOderLink().should('contain.text', ' Track my order ') 
  onMyOrderPage.getViewOrderDetailsLink().should('contain.text', 'View order details')

})