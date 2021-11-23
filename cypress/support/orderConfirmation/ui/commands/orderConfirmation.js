import onOrderConfirmationPage from '../pageObjects/OrderConfirmationPage'

Cypress.Commands.add('verifyOrderConfirmation', () => {
  // Verify order confirmation page
  cy.log('Order placed! Order details: ' + cy.url())
  onOrderConfirmationPage.getOrderConfirmationHeader().should('be.visible').and('have.text', 'Order received')
  cy.url().should('include', '/confirmation')
  onOrderConfirmationPage.getOrderConfirmationHeader().then(function (element) {
    cy.log(element.text())
  })

  // TO-DO return order details
  const orderDetails = cy.url()
  return orderDetails
  // TO-DO verify the items and amount on order confirmation page
})
