Cypress.Commands.add('verifyCartContent', (test) => {
  const items = test.items
  const noOfItems = test.items.length
  cy.log('noOfItems: ' + noOfItems)
  let index = 0
  items.forEach(item => {
    //Verify the item amount * quantity
    cy.log('index: ' + noOfItems - index)
    const expectedAmount = item.pricePerItem * item.quantity
    cy.log('expectedAmount: ' + expectedAmount)
    cy.get(':nth-child('+ (noOfItems - index) +') > .cart-item > .cart-item-product > .cart-item-details > .cart-item-cart-controls-wrapper > .cart-item-cart-controls-price > .cart-item-prices-container > shared-price > .price').should('include.text', expectedAmount)              
    index++
  })
})
