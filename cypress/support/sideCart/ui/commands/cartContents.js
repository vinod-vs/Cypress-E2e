Cypress.Commands.add('verifyCartContent', (test) => {
  const items = test.items
  const noOfItems = test.items.length
  cy.log('noOfItems: ' + noOfItems)
  let index = 0
  items.forEach(item => {
    // Verify the item price (pricePerItem * quantity) or promo price
    // Get promo value if any
    cy.log('index: ' + Number(noOfItems - index))
    // If promotion is applied
    const priceLocator = ':nth-child(' + (noOfItems - index) + ') > .cart-item > .cart-item-product > .cart-item-details > .cart-item-cart-controls-wrapper > .cart-item-cart-controls-price > .cart-item-prices-container > shared-price > .price'
    const promoLocator = ':nth-child(' + (noOfItems - index) + ') > .cart-item > .cart-item-message > div > div.cartItemMessage-content > span:contains("You\'ve saved")'
    cy.checkIfElementExists(promoLocator).then((isThereAPromotionOnTheItem) => {
      cy.log(isThereAPromotionOnTheItem)
      if (isThereAPromotionOnTheItem === true) {
        cy.get(promoLocator).then(function (promoPrice) {
          const promoPriceValue = promoPrice.text().toString().split('$')[1]
          item.promoPrice = promoPriceValue
          item.hasPromo = true
          cy.log('PromoPriceValue: ' + item.promoPrice)
          const expectedAmountAfterPromo = (Number(item.pricePerItem) * Number(item.quantity)) - Number(item.promoPrice)
          cy.log('Price after promo: ' + expectedAmountAfterPromo)
          cy.get(priceLocator).should('include.text', Number(item.pricePerItem) * Number(item.quantity) - Number(promoPriceValue))
        })
      } else {
        cy.log('nonPromo')
        const expectedAmount = item.pricePerItem * item.quantity
        cy.log('ExpectedAmount: ' + expectedAmount)
        cy.get(priceLocator).should('include.text', expectedAmount)
      }
    })
    index++
  })
  cy.log(JSON.stringify(test))
})
