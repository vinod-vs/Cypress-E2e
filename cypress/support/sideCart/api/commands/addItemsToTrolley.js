import addItemsRequestBody from '../../../../fixtures/sideCart/addItemsToTrolley.json'
import searchRequestBody from '../../../../fixtures/search/productSearch.json'
import { restrictionType } from '../../../../fixtures/product/restrictionType.js'
import { getPmRestrictedWowItems as pmRestrictedItems, getGroupLimitRestrictedWowItems as groupLimitRetrictedItems, getAgeRestrictedWowItems as ageRestrictedItems } from '../../../../support/search/api/commands/search.js'

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

    trolleyArr.push({ stockcode: item.Stockcode, quantity: 1 })

    expectedTrolleyItems.push({ stockcode: item.Stockcode, name: item.Name, price: item.Price, quantity: 1, isSubstitutable: true, shopperNotes: '' })
    addItemsRequestBody.items = expectedTrolleyItems

    if (totalPrice > 60.0) {
      break
    }
  }

  return cy.wrap(trolleyArr)
})

Cypress.Commands.add('addAvailableNonRestrictedPriceLimitedWowItemsToTrolley', (searchTerm, totalThreshold) => {
  searchRequestBody.SearchTerm = searchTerm
  searchRequestBody.SortType = 'PriceDesc'

  cy.productSearch(searchRequestBody).then((searchResponse) => {
    cy.findAvailableNonRestrictedWowItems(searchResponse).then((itemResponse) => {
      const productArr = getPriceLimitedItemsForTrolleyAddition(itemResponse, totalThreshold)
      addToTrolleyAfterReducingProductProperties(productArr)

      return cy.wrap(productArr)
    })
  })
})

function addToTrolleyAfterReducingProductProperties (productArr) {
  productArr.map(({ name, price, isSubstitutable, shopperNotes, ...trolleyProperties }) => trolleyProperties).forEach((item) => {
    cy.addItemsToTrolley(item)
  })
}

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

Cypress.Commands.add('addAvailableNonRestrictedItemCountLimitedWowItemsToTrolley', (searchTerm, count) => {
  searchRequestBody.SearchTerm = searchTerm
  searchRequestBody.SortType = 'TraderRelevance'

  cy.productSearch(searchRequestBody).then((searchResponse) => {
    cy.findAvailableNonRestrictedWowItems(searchResponse).then((itemResponse) => {
      cy.log('Adding Available Count Limited...')
      const productArr = getCountLimitedItemsForTrolleyAddition(itemResponse, count)
      addToTrolleyAfterReducingProductProperties(productArr)

      return cy.wrap(productArr)
    })
  })
})

Cypress.Commands.add('addAvailableRestrictedWowItemsToTrolley', (type, count) => {
  let restrictedProducts

  switch (type) {
    case restrictionType.MORNING:
      searchRequestBody.SearchTerm = 'Bakery'
      searchRequestBody.SortType = 'TraderRelevance'

      cy.productSearch(searchRequestBody).then((searchResponse) => {
        restrictedProducts = pmRestrictedItems(searchResponse)
        const productArr = getCountLimitedItemsForTrolleyAddition(restrictedProducts, count)
        addToTrolleyAfterReducingProductProperties(productArr)

        return cy.wrap(productArr)
      })
      break

    case restrictionType.GROUP:
      searchRequestBody.SearchTerm = 'Baby Formula'
      searchRequestBody.SortType = 'TraderRelevance'

      cy.productSearch(searchRequestBody).then((searchResponse) => {
        restrictedProducts = groupLimitRetrictedItems(searchResponse)
        const productArr = getCountLimitedItemsForTrolleyAddition(restrictedProducts, count)
        addToTrolleyAfterReducingProductProperties(productArr)

        return cy.wrap(productArr)
      })
      break

    case restrictionType.AGE:
      searchRequestBody.SearchTerm = 'Liquor'
      searchRequestBody.SortType = 'TraderRelevance'

      cy.productSearch(searchRequestBody).then((searchResponse) => {
        restrictedProducts = ageRestrictedItems(searchResponse)
        const productArr = getCountLimitedItemsForTrolleyAddition(restrictedProducts, count)
        addToTrolleyAfterReducingProductProperties(productArr)

        return cy.wrap(productArr)
      })
      break
  }
})

function getPriceLimitedItemsForTrolleyAddition (productArray, totalThreshold) {
  const trolleyArr = []
  const expectedTrolleyItems = []
  let totalPrice = 0.0

  for (const item of productArray) {
    totalPrice = totalPrice + item.Price

    trolleyArr.push({ stockcode: item.Stockcode, quantity: 1 })

    expectedTrolleyItems.push({ stockcode: item.Stockcode, name: item.Name, price: item.Price, quantity: 1, isSubstitutable: true, shopperNotes: '' })

    if (totalPrice >= totalThreshold) {
      break
    }
  }
  addItemsRequestBody.items = expectedTrolleyItems

  return expectedTrolleyItems
}

function getCountLimitedItemsForTrolleyAddition (productArray, itemCount) {
  const expectedTrolleyItems = []

  if (productArray.length == 0) {
    throw ('No products found for Count Limited Trolley Addition')
  }

  const trolleyArr = []
  let addedToCart = 0

  for (const item of productArray) {
    trolleyArr.push({ stockcode: item.Stockcode, quantity: 1 })
    expectedTrolleyItems.push({ stockcode: item.Stockcode, name: item.Name, price: item.Price, quantity: 1, isSubstitutable: true, shopperNotes: '' })

    addedToCart++
    if (addedToCart === itemCount) {
      break
    }
  }
  addItemsRequestBody.items = expectedTrolleyItems

  return trolleyArr
}

Cypress.Commands.add('addAvailableEDMItemsToTrolley', (searchTerm, quantity) => {
  // Search product by overriding the SearchTerm attribute in the search body request fixture
  cy.productSearch({ ...searchRequestBody, SearchTerm: searchTerm })
    .then((searchResponse) => {
      cy.wrap(searchResponse.Products
      // Filter search results by IsMarketProduct = true and IsAvailable = true
        .filter(searchProduct => searchProduct.Products[0].IsMarketProduct && searchProduct.Products[0].IsAvailable)
      // Pick the first result
        .shift()).then((edmItem) => {
        // Add the product to the trolley and pass the quantity in the param to override the quantity attribute
        // in the trolley request body fixture
        cy.addItemsToTrolley({ ...addItemsRequestBody, StockCode: edmItem.Products[0].Stockcode, Quantity: quantity })
      })
    })
})

Cypress.Commands.add('addAvailableQuantityLimitedItemsToTrolley', (searchTerm, quantity) => {
  // Search product by overriding the SearchTerm attribute in the search body request fixture
  cy.productSearch({ ...searchRequestBody, SearchTerm: searchTerm })
    .then((searchResponse) => {
      const product = searchResponse.Products
      // Filter search results by IsAvailable = true
        .filter(searchProduct => searchProduct.Products[0].IsAvailable)
      // Pick the first result
        .shift()
      const productStockcode = product.Products[0].Stockcode

      // Add the product to the trolley and pass the quantity in the param to override the quantity attribute
      // in the trolley request body fixture
      cy.addItemsToTrolley({ ...addItemsRequestBody, StockCode: productStockcode, Quantity: quantity })
    })
})

Cypress.Commands.add('addEDMItemsBasedOnMinCartValueToTrolley', (testData) => {
  // Search product by overriding the SearchTerm attribute in the search body request fixture
  cy.productSearch({ ...searchRequestBody, SearchTerm: testData.searchTerm })
    .then((searchResponse) => {
      const product = searchResponse.Products
      // Filter search results by IsAvailable = true
        .filter(searchProduct => searchProduct.Products[0].IsAvailable)
      // Pick the first result
        .shift()
      testData.stockcode = product.Products[0].Stockcode

      // Add the product to the trolley and pass the quantity based on the total Price
      const unitPrice = product.Products[0].Price
      const minProductQuantity = Math.ceil(testData.minCartValue/unitPrice)
      const finalQty = minProductQuantity + 10
      const totalPrice = finalQty * unitPrice
     
      testData.sellerName = product.Products[0].AdditionalAttributes['Market.Seller_BusinessName']
      cy.addItemsToTrolley({ ...addItemsRequestBody, StockCode: testData.stockcode, Quantity: finalQty })
      cy.wrap(finalQty).as('finalQty')
    })
})
