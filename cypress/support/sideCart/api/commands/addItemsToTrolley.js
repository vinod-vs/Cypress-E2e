import searchRequestBody from '../../../../fixtures/search/productSearch.json'
import addItemsRequestBody from '../../../../fixtures/sideCart/addItemsToTrolley.json'

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

Cypress.Commands.add('addAvailableNonRestrictedWowItemsToTrolley', (searchTerm) => {
  cy.productSearch({ ...searchRequestBody, SearchTerm: searchTerm }).then((searchResponse) => {
    expect(searchResponse.SearchResultsCount).to.be.greaterThan(0)
    cy.findAvailableNonRestrictedWowItems(searchResponse).then((itemResponse) => {
      cy.curateProductsForTrolley(itemResponse).then((curatedItemList) => {
        curatedItemList.forEach((curatedItem) => {
          cy.addItemsToTrolley(curatedItem)
        })
      })
    })
  })
})

Cypress.Commands.add('addAvailableEDMItemsToTrolley', (searchTerm, quantity) => {
  // Search product by overriding the SearchTerm attribute in the search body request fixture
  cy.productSearch({ ...searchRequestBody, SearchTerm: searchTerm })
    .then((searchResponse) => {
      const edmSearchProduct = searchResponse.Products
      // Filter search results by IsMarketProduct = true and IsAvailable = true
        .filter(searchProduct => searchProduct.Products[0].IsMarketProduct && searchProduct.Products[0].IsAvailable)
      // Pick the first result
        .shift()
      const edmProductStockcode = edmSearchProduct.Products[0].Stockcode

      // Add the product to the trolley and pass the quantity in the param to override the quantity attribute
      // in the trolley request body fixture
      cy.addItemsToTrolley({ ...addItemsRequestBody, StockCode: edmProductStockcode, Quantity: quantity })
    })
})
