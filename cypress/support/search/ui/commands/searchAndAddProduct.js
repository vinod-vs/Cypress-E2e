/// <reference types="cypress-xpath" />
import HomePage from '../../../homePage/ui/pageObjects/HomePage'
import SideCartPage from '../../../sideCart/ui/pageObjects/SideCartPage'
import SearchResultsPage from '../pageObjects/SearchResultsPage'

const homePage = new HomePage()
const sideCartPage = new SideCartPage()
const searchResultsPage = new SearchResultsPage()

Cypress.Commands.add('searchAndAddProductsToCart', (testData) => {
  const items = testData.items
  items.forEach(item => {
    cy.log('Adding item: ' + item.stockCode + ', of quantity: ' + item.quantity + ' to cart.')
    // Search for the desired item
    homePage.getSearchHeader().click()
    homePage.getSearchHeader().type(item.stockCode).type('{enter}')

    // Capture the item price
    cy.wait(Cypress.config('oneSecondWait'))
    searchResultsPage.getProductPrice().then(function (amountElement) {
      const amount = amountElement.text()
      item.pricePerItem = amount.split('$')[1]
      cy.log('Item amount: ' + item.pricePerItem)
    })

    // Adding item once
    cy.get('.cartControls-addCart').click()
    cy.wait(Cypress.config('halfSecondWait'))
    // Side cart is opened when first item is added. Close it if opened.
    cy.checkIfElementExists(sideCartPage.getCloseSideCartButtonLocatorString()).then((returnedValue) => {
      if (returnedValue === true) {
        cy.wait(Cypress.config('halfSecondWait'))
        sideCartPage.getCloseSideCartButton().click()
        cy.wait(Cypress.config('halfSecondWait'))
      }
    })

    // Adding desired quantity
    let i
    for (i = 1; i < item.quantity; i++) {
      searchResultsPage.getIncreaseQuantityButton().eq(0).click()
      cy.wait(Cypress.config('halfSecondWait'))
    }

    // Verify the right quantity is added
    cy.get('.cartControls-quantityInput').then(function (quantityElement) {
      const quantity = quantityElement.text()
      cy.log('Quantity added: ' + quantity)
    })
    cy.wait(Cypress.config('oneSecondWait'))

    // Clear search
    homePage.getClearSearchHeader().click()
    cy.wait(Cypress.config('oneSecondWait'))

    // TO-DO verify the desired item and quantity is added to cart
  })
})

Cypress.Commands.add('getProductTitle', (itemIndexOrPositionOnSearchResultsPage, itemToAdd) => {
  // function getProductTitle(index, item) {
  const itemTitleLocatorString = searchResultsPage.getItemTitleLocatorString().replace('INDEX', itemIndexOrPositionOnSearchResultsPage)
  cy.log('itemTitleLocatorString: ' + itemTitleLocatorString)
  cy.checkIfElementExists(itemTitleLocatorString).then((isProductTitleAvailable) => {
    cy.log('isProductTitleAvailable: ' + isProductTitleAvailable)
    if (isProductTitleAvailable === true) {
      cy.get(itemTitleLocatorString).then(function (titleElement) {
        const title = titleElement.text()
        itemToAdd.title = title
        cy.log('Product Title: ' + itemToAdd.title)
      })
    }
  })
})

Cypress.Commands.add('addProductsToCart', (itemIndexOrPositionOnSearchResultsPage, itemToAdd) => {
  cy.getItemPrice(itemIndexOrPositionOnSearchResultsPage, itemToAdd)
  cy.addToCart(itemIndexOrPositionOnSearchResultsPage)
  cy.closeSideCart()
  cy.increaseItemQuantity(itemIndexOrPositionOnSearchResultsPage, itemToAdd)
})

Cypress.Commands.add('addToCart', (itemIndexOrPositionOnSearchResultsPage) => {
  const addToCartLocator = searchResultsPage.getAddToCartByItemLocatorString().replace('INDEX', itemIndexOrPositionOnSearchResultsPage)
  cy.log('addToCartLocator: ' + addToCartLocator)
  cy.wait(Cypress.config('halfSecondWait'))
  cy.get(addToCartLocator).click()
  cy.wait(Cypress.config('halfSecondWait'))
})

Cypress.Commands.add('closeSideCart', () => {
  cy.checkIfElementExists(sideCartPage.getCloseSideCartButtonLocatorString()).then((returnedValue) => {
    if (returnedValue === true) {
      cy.log('Closing opened side cart.')
      cy.wait(Cypress.config('halfSecondWait'))
      sideCartPage.getCloseSideCartButton().click()
      cy.wait(Cypress.config('halfSecondWait'))
    }
  })
})

Cypress.Commands.add('getItemPrice', (itemIndexOrPositionOnSearchResultsPage, itemToAdd) => {
  const priceLocator = searchResultsPage.getProductPriceByItemLocatorString().replace('INDEX', itemIndexOrPositionOnSearchResultsPage)
  cy.log('priceLocator: ' + priceLocator)
  cy.wait(Cypress.config('oneSecondWait'))
  cy.get(priceLocator).then(function (amountElement) {
    const amount = amountElement.text()
    itemToAdd.pricePerItem = amount.split('$')[1]
    cy.log('Item amount: ' + itemToAdd.pricePerItem)
  })
})

Cypress.Commands.add('increaseItemQuantity', (itemIndexOrPositionOnSearchResultsPage, itemToAdd) => {
  const increaseQuantityLocator = searchResultsPage.getIncreaseQuantityButtonByItemLocatorString().replace('INDEX', itemIndexOrPositionOnSearchResultsPage)
  let j
  for (j = 1; j < itemToAdd.quantity; j++) {
    cy.log('Increasing Item quantity: ' + j)
    cy.get(increaseQuantityLocator).click()
    cy.wait(Cypress.config('halfSecondWait'))
  }
})

const findAndAddProduct = (itemToAdd) => {
  const findProduct = (itemIndexOrPositionOnSearchResultsPage) => {
    let productFound = false
    cy.get(searchResultsPage.getAddToCartByItemLocatorString1()).its('length').then((len) => {
      if (itemIndexOrPositionOnSearchResultsPage >= len) return

      const addToCartLocator = searchResultsPage.getAddToCartByItemLocatorString().replace('INDEX', itemIndexOrPositionOnSearchResultsPage)
      const marketProductLocator = searchResultsPage.getMarketProductRoundelLocatorString().replace('INDEX', itemIndexOrPositionOnSearchResultsPage)
      cy.log(addToCartLocator)
      cy.log(marketProductLocator)

      cy.log('Searching for product at index: ' + itemIndexOrPositionOnSearchResultsPage)
      cy.getProductTitle(itemIndexOrPositionOnSearchResultsPage, itemToAdd)

      cy.checkIfElementExists(addToCartLocator).then((isProductAvailable) => {
        cy.log('isProductAvailable: ' + isProductAvailable)
        if (isProductAvailable === true) {
          cy.log('Found avaialble product at index: ' + itemIndexOrPositionOnSearchResultsPage)
          if (itemToAdd.isEMProduct === 'true') {
            cy.log('Need an EM product')
            cy.checkIfElementExists(marketProductLocator).then((isMarketProduct) => {
              cy.log('isMarketProduct: ' + isMarketProduct)
              if (isMarketProduct === true) {
                cy.log('The avaialble product is an market product. Adding to cart')
                cy.addProductsToCart(itemIndexOrPositionOnSearchResultsPage, itemToAdd)
                productFound = true
                return false
              }
            })
          } else {
            cy.log('Need an regular product')
            cy.log('Found avaialble regular product. Adding to cart')
            cy.addProductsToCart(itemIndexOrPositionOnSearchResultsPage, itemToAdd)
            productFound = true
            return false
          }
        } else {
          cy.log('Product at index: ' + itemIndexOrPositionOnSearchResultsPage + ' , is Unavailable.')
        }
      }).then(() => {
        if (!productFound) findProduct(++itemIndexOrPositionOnSearchResultsPage)
      })
    })
  }
  findProduct(0)
}

Cypress.Commands.add('searchAndAddProductsToCartBySearchTerm', (testData) => {
  const items = testData.items
  items.forEach(item => {
    cy.log('Searching for item: ' + item.searchTerm + ' , isEMProduct: ' + item.isEMProduct)
    // Search for the desired item
    homePage.getSearchHeader().click()
    homePage.getSearchHeader().type(item.searchTerm).type('{enter}')
    cy.wait(Cypress.config('fiveSecondWait'))

    // Find and add products
    findAndAddProduct(item)

    // Clear search
    homePage.getClearSearchHeader().click()
    cy.wait(Cypress.config('oneSecondWait'))
  })
})
