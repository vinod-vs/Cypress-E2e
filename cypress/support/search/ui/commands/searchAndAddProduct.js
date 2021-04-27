import HomePage from '../../../homePage/ui/pageObjects/HomePage'
import SideCartPage from '../../../sideCart/ui/pageObjects/SideCartPage'
import SearchResultsPage from '../pageObjects/SearchResultsPage'

const homePage = new HomePage()
const sideCartPage = new SideCartPage()
const searchResultsPage = new SearchResultsPage()

Cypress.Commands.add('searchAndAddProductsToCart', (test) => {
  let sideCartAlreadyClosed = false
  const items = test.items
  items.forEach(item => {
    cy.log('Adding item: ' + item.stockCode + ', of quantity: ' + item.quantity + ' to cart.')
    // Search for the desired item
    homePage.getSearchHeader().click()
    homePage.getSearchHeader().type(item.stockCode).type('{enter}')

    // Capture the item price
    searchResultsPage.getProductPrice().then(function (amountElement) {
      const amount = amountElement.text()
      item.pricePerItem = amount.split('$')[1]
      cy.log('Item amount: ' + item.pricePerItem)
    })

    // Add item with desired quantity to the cart
    // Adding item once
    cy.get('.cartControls-addCart').click()
    // Side cart is opened when first item is added. To close it, force click on the search box again
    if (sideCartAlreadyClosed === false) {
      cy.wait(Cypress.config('halfSecondWait'))
      sideCartPage.getCloseSideCartButton().click()
      cy.wait(Cypress.config('halfSecondWait'))
      sideCartAlreadyClosed = true
    }

    // Adding remaining quantity
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
