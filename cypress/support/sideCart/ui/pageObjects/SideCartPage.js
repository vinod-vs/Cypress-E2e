class SideCartPage {
  getCloseSideCartButton () {
    return cy.get('.close-button > .iconAct-Close_Cancel')
  }

  getCloseSideCartButtonLocatorString () {
    return '.close-button > .iconAct-Close_Cancel'
  }

  getViewCartButton () {
    return cy.get('button[class*="headerCheckout-orderHeader"]')
  }

  getClearEntireCartLink () {
    return cy.get('.product-actionsClearCart > span')
  }

  getConfirmClearCartLink () {
    return cy.get('shared-button[ervalue="Clear cart click"]')
  }

  getCheckoutButton () {
    return cy.get('.cart-checkout-button > .button')
  }

  getEmptyCartImage () {
    return cy.get('.empty-cart-image')
  }

  getEmptyCartTitle () {
    return cy.get('.empty-cart-title')
  }
}

export default SideCartPage
