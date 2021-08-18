Cypress.Commands.add('addItemsToTrolley', (addItemsBody) => {
  cy.request('POST', Cypress.env('addItemsToTrolleyEndpoint'), addItemsBody).then((response) => {
    return response.body
  })
})

Cypress.Commands.add('curateProductsForTrolley', (productArray) => {
  const trolleyArr = []
  const expectedTrolleyItems = []
  let totalPrice = 0.0

  for (const item of productArray) {
    totalPrice = totalPrice + item.Price
    cy.log('Item Price is: ' + item.Price)
    trolleyArr.push({ stockcode: item.Stockcode, quantity: 1 })

    // TODO: RC 17/08/21: Output this to a file for later verification
    expectedTrolleyItems.push({ stockcode: item.Stockcode, name: item.Name, price: item.Price, quantity: 1, isSubstitutable: true, shopperNotes: '' })
    cy.log('Total Price is: ' + totalPrice)

    if (totalPrice > 60.0) {
      break
    }
  }

  return cy.wrap(trolleyArr)
})
