import { onHomePage } from '../../../homePage/ui/pageObjects//HomePage'
import { onCheckoutPage } from '../../../checkout/ui/pageObjects/CheckoutPage'
import { onSideCartPage } from '../../../sideCart/ui/pageObjects/SideCartPage'

Cypress.Commands.add('clearTrolley', (shopper) => {
  // clear cart if required
  // open cart if it has >0 amount and clear it
  onHomePage.getCartAmount().then(function (cartElement) {
    cy.log(cartElement.text())
    const cartAmount = cartElement.text()
    if (cartAmount.includes('$0')) {
      cy.log('Cart has no items. Cart Value: ' + cartAmount)
    } else {
      cy.log('Cart has some items.  Cart Value: ' + cartAmount + '. Removing them.')
      onSideCartPage.getViewCartButton().click()
      onSideCartPage.getClearEntireCartLink().click()
      cy.wait(Cypress.config('oneSecondWait'))
      onSideCartPage.getConfirmClearCartLink().click()
      cy.wait(Cypress.config('oneSecondWait'))

      // Verify the cart is empty
      cy.verifyEmptyCart()

      // Close cart
      cy.closeCart()
    }
  })
})

Cypress.Commands.add('viewCart', () => {
  // Click on View Cart button to Open the cart
  onSideCartPage.getViewCartButton().click()
  cy.wait(Cypress.config('oneSecondWait'))

  // Verify the cart is open
  onSideCartPage.getCheckoutButton().should('be.visible')
})

Cypress.Commands.add('closeCart', () => {
  // Click Close cart
  onSideCartPage.getCloseSideCartButton().click()
  cy.wait(Cypress.config('oneSecondWait'))

  // Verify the cart is closed
  onHomePage.getCartAmount().should('be.visible')
})

Cypress.Commands.add('clickCheckout', () => {
  // Click on Checkout button on the opened side cart
  onSideCartPage.getCheckoutButton().click()
  cy.url().should('include', '/checkout')
  cy.wait(Cypress.config('oneSecondWait'))

  // Verify checkout page is open
  onCheckoutPage.getPaymentInstructionsFrame().should('be.visible')
})

Cypress.Commands.add('verifyEmptyCart', () => {
  // Verify the cart is empty
  onSideCartPage.checkIfSidecartIsEmpty();
})
