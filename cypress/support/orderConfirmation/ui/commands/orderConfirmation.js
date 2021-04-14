import ConfirmationPage from '../pageObjects/ConfirmationPage'

const confirmationPage = new ConfirmationPage()

Cypress.Commands.add('verifyOrderConfirmation', () => {
  // Verify order confirmation page
  cy.log('Order placed! Order details: ' + cy.url())
  confirmationPage.getOrderConfirmationHeader().should('be.visible').and('have.text', 'Order received')
  cy.url().should('include', '/confirmation')
  confirmationPage.getOrderConfirmationHeader().then(function (element) {
    cy.log(element.text())
  })

  // TO-DO return order details
  const orderDetails = cy.url()
  return orderDetails
  // TO-DO verify the items and amount on order confirmation page
})
