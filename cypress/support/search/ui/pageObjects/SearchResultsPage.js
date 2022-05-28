import { onHomePage } from '../../../homePage/ui/pageObjects/HomePage'
import { onSideCartPage } from '../../../sideCart/ui/pageObjects/SideCartPage'
import searchRequestPayload from '../../../../fixtures/search/productSearch.json'
import '../../../../support/search/api/commands/search'

export class SearchResultsPage {
  addItemToCart (itemPositionNumber) {
    return cy.get('#search-content .product-grid > div:nth-child(' + itemPositionNumber + ') .cartControls-addCart')
  }

  getIncreaseQuantityButton () {
    return cy.get('.cartControls-incrementButton')
  }

  getProductPrice () {
    return cy.get('.price.price--large.ng-star-inserted')
  }

  getProductPriceByItemLocatorString () {
    return '#search-content .product-grid > div:nth-child(INDEX) .price.price--large.ng-star-inserted'
  }

  getIncreaseQuantityButtonByItemLocatorString () {
    return '#search-content .product-grid > div:nth-child(INDEX) .cartControls-incrementButton'
  }

  getQuantityInputFieldByItemLocatorString () {
    return '#search-content .product-grid > div:nth-child(INDEX) .cartControls-quantityInput'
  }

  getAddToCartByItemLocatorString () {
    return '#search-content .product-grid > div:nth-child(INDEX) .cartControls-addCart'
  }

  getAddToCartByItemLocatorString1 () {
    return '#search-content .product-grid > div .cartControls-addCart'
  }

  getAllAddToCartButtons () {
    return cy.get('.cartControls-addButton .cartControls-addCart')
  }

  getMarketProductRoundelLocatorString () {
    return '#search-content .product-grid > div:nth-child(INDEX) img[alt="Everyday Market Product"]'
  }

  getItemTitleLocatorString () {
    return '#search-content .product-grid > div:nth-child(INDEX) .shelfProductTile-descriptionLink'
  }

  getSaveToListButton () {
    return cy.get('button.productSaveToList-buttonLink')
  }

  getCreateANewListButton () {
    return cy.get('button.productSaveToList-actionItems-createList')
  }

  getNewListNameTextInput () {
    return cy.get('#productSaveToList-input')
  }

  getCreateNewListActionButton () {
    return cy.get('button.productSaveToList-actionItems-createButton')
  }

  getTheListnameCheckBox (listName) {
    return cy.get("input[name='" + listName + "']")
  }

  getProductSaveToNewListButton () {
    return cy.get('button.productSaveToList-actionItems-saveButton')
  }

  getProductTitle () {
    return cy.get('shared-product-tile')
  }

  getProductSavedNotification () {
    return cy.get('shared-toast')
  }

  getAllPageNumberElements () {
    return cy.get('.paging-pageNumber')
  }

  getGoNextButton () {
    return cy.get('.next-marker')
  }

  getSortByDropdownButton() {
    return cy.get('.sort-by-dropdown button')
  }

  getSortProductsDropdownOptionsSpan (){
    return cy.get('span.dropdown-item__button')
  }

  getOkButtonInRestrictedItemsPopup() {
    return cy.get('.primary > .ng-star-inserted').contains('Ok, got it')
  }

  sortSearchResultProductsBy(sortByOptionText) {
    this.getSortByDropdownButton().should('be.visible').click({force: true})

    cy.intercept({
      method: 'POST',
      url: Cypress.env('productSearchEndpoint'),
    }).as('productSearch')

    cy.get('.sort-by-dropdown ul').contains(sortByOptionText).click()
    
    cy.wait('@productSearch')
  }

  sortCategoryProductsBy(sortByOptionText) {
    this.getSortByDropdownButton().should('be.visible').click({force: true})

    cy.intercept({
      method: 'POST',
      url: Cypress.env('browseCategoryendpoint'),
    }).as('browseCategory')

    cy.get('.sort-by-dropdown ul').contains(sortByOptionText).click()
    
    cy.wait('@browseCategory')
  }

  addRandomProductsFromEachDepartmentToCartUntilReachSpendThreshold (spendThreshold) {
    var cartAmountText=""
    var cartAmount=0
    var totalCartValue = parseFloat(spendThreshold)

    onHomePage.getSecondCategoryMenuItem().click({force: true})
    cy.wait(2000)
    onHomePage.getSubMenuItemLinks().first().click()
    onHomePage.getSubMenuItemLinks().contains('Show All').click()

    this.sortCategoryProductsBy('Price High to Low')
    //get all main menus to travel thru each main menu > first sub menu to add first available item to cart
    onHomePage.getCategoryMenuItemLinks().not('.categoryHeader-navigationLink.is-special').not('[href="/shop/browse/bakery"]').each(($el, $index, $list) => {
      //get cart total
      onHomePage.getCartAmountInHeader().then(($cartAmtEl) => {
        cartAmountText=$cartAmtEl.text()
        cartAmountText=cartAmountText.substring(1,cartAmountText.length)
        cartAmount = parseFloat(cartAmountText)
        //add Item to cart only if current cart value is less than expected cart value
        if(cartAmount < totalCartValue){
          //navigate to menu and click on first 'Add to cart' button if visible
          cy.wrap($el).click({force:true})
          onHomePage.getSubMenuItemLinks().first().click()
          onHomePage.getSubMenuItemLinks().contains('Show All').click()
          cy.wait(Cypress.config('fiveSecondWait'))
          cy.checkIfElementVisible('.cartControls-addButton').then((visibleAddCart) => {
            if(visibleAddCart===true){
              this.getAllAddToCartButtons().first().should('be.visible').click()
            }
          })
          cy.wait(Cypress.config('halfSecondWait'))
          //click on 'OK got it' button if resticted items popup appears
          cy.checkIfElementVisible('.primary > .ng-star-inserted').then((visiblePopupBtn) => {
            if(visiblePopupBtn===true){
              this.getOkButtonInRestrictedItemsPopup().should('be.visible').click()
            }
          })
          //check cart if any items are under any notifications and remove them
          onSideCartPage.removeAllItemsUnderNotificationGroupsFromCart()
        }
      })
    }) 
  }

  searchAndAddAvailableWowItemsToCartUntilReachMinSpendThreshold(searchTerm, minSpendThreshold)
  {
    onHomePage.getSearchHeader().click()
    onHomePage.getSearchHeader().type(searchTerm).type('{enter}')

    cy.checkIfElementExists('.no-results-primary-text').then(result => {
      if(result == true){
        throw new Error('Unable to find any result')
      }
    })

    this.sortSearchResultProductsBy('Price High to Low')

    cy.checkIfElementExists('.paging-pageNumber').then(result => {
      if(!result){
        this.#addAvailableProductsToCartFromCurrentPage(minSpendThreshold)
      }
      else{
        let searchResultPageStartIndex = 1
        this.getAllPageNumberElements().last().then(lastPageNumberElement => {
          this.#addAvailableProductsToCartFromAllPagesRecursively(searchTerm, minSpendThreshold, searchResultPageStartIndex, Number(lastPageNumberElement.text()))
        })
      }
    })  
  }

  #addAvailableProductsToCartFromCurrentPage(searchTerm, minSpendThreshold)
  {
    cy.checkIfElementExists('.cartControls-addButton .cartControls-addCart').then(result => {
      if(result){
        this.#addAvailableProductsUntilReachMinSpendThreshold(searchTerm, minSpendThreshold)
      }
    })
  }

  #addAvailableProductsToCartFromAllPagesRecursively(searchTerm, minSpendThreshold, currentPageIndex, lastPageIndex)
  {
    if(currentPageIndex > lastPageIndex)
    {
      throw new Error('All search result products are out of stock or unavailable')
    }

    cy.intercept({
      method: 'POST',
      url: Cypress.env('productSearchEndpoint'),
    }).as('productSearch')

    cy.checkIfElementExists('.cartControls-addButton .cartControls-addCart').then(result => {
      if(result){
        this.#addAvailableProductsUntilReachMinSpendThreshold(searchTerm, minSpendThreshold)
      }
      else{
        this.getGoNextButton().click()
        cy.wait('@productSearch')
        this.#addAvailableProductsToCartFromAllPagesRecursively(searchTerm, minSpendThreshold, currentPageIndex + 1, lastPageIndex)
      }
    })
  }

  #addAvailableProductsUntilReachMinSpendThreshold(searchTerm, minSpendThreshold)
  {
    cy.intercept({
      method: 'POST',
      url: Cypress.env('productSearchEndpoint'),
    }).as('productSearch')

    cy.checkIfElementExists('.cartControls-addButton .cartControls-addCart').then(result => {
      if(!result){
        this.getGoNextButton().click()
        cy.wait('@productSearch')
      }
      else{
        cy.checkIfElementExists('.paging-pageNumber').then(result => {
          if(result){
            cy.get('.paging-section a.is-selected').invoke('attr', 'href').then(href => {
              const pageNumber = Number(href.substring(href.lastIndexOf('=') + 1))
              cy.wrap(pageNumber).as('currentPageNumber')
            })

            cy.get('wow-record-count div').then(recordCountElement => {
              let recordCountRange = recordCountElement.text().substring(0, recordCountElement.text().indexOf('of'))
              //below unicode '–' got from UI, it is different with normal char '-'
              let recordCountArray = recordCountRange.split('–')
              let pageSize = Number(recordCountArray[1].trim()) - Number(recordCountArray[0].trim()) + 1
              cy.wrap(pageSize).as('pageSize')
            })  
          }
          else{
            cy.wrap(1).as('currentPageNumber')
            cy.wrap(50).as('pageSize')
          }
        })

        //fetch result set from API then add products referring to api result set
        cy.get('@currentPageNumber').then(currentPageNumber => {
          cy.get('@pageSize').then(pageSize => {
            cy.getNonRestrictedWowItemSetFromApiSearch({...searchRequestPayload, PageNumber: currentPageNumber, PageSize: pageSize, SearchTerm: searchTerm, SortType: 'PriceDesc'}).then(apiResultSet => {
              cy.get('.shelfProductTile').then(tileList => {
                this.#traverseAddingProductsUntilReachMinspendThreshold(minSpendThreshold, 0, tileList.length, apiResultSet)
              })
            })  
          })    
        })
      }
      
      onSideCartPage.getTotalAmountElementOnHeader().then(totalAmountEle => {
        if(Number(totalAmountEle.text().substring(1)) < Number(minSpendThreshold)) {
          this.getGoNextButton().click()
          cy.wait('@productSearch')
          this.#addAvailableProductsUntilReachMinSpendThreshold(searchTerm, minSpendThreshold)
        }
      }) 
    })
  }

  #traverseAddingProductsUntilReachMinspendThreshold(minSpendThreshold, currentProductIndex, totalProductCount, apiProductSearchResultSetAsReference)
  {
    cy.intercept({
      method: 'POST',
      url: Cypress.env('productSearchEndpoint'),
    }).as('productSearch')

    if(currentProductIndex >= totalProductCount){
      this.getGoNextButton().click()
      cy.wait('@productSearch')
    }
    else{
      cy.get('.shelfProductTile').eq(currentProductIndex).then(element => {
        if(apiProductSearchResultSetAsReference.some(o => o.DisplayName == element.find('.shelfProductTile-descriptionLink').text().trim())){
          cy.wrap(element).find('.cartControls-addCart').click({force: true})
          this.#increaseProductQuantityUntilReachMinSpendThreshold(minSpendThreshold, element)
          
          onSideCartPage.getTotalAmountElementOnHeader().then(totalAmountEle => {
            if(Number(totalAmountEle.text().substring(1)) < Number(minSpendThreshold)) {
              this.#traverseAddingProductsUntilReachMinspendThreshold(minSpendThreshold, currentProductIndex + 1, totalProductCount, apiProductSearchResultSetAsReference)
            }
          })
        }
        else{
          this.#traverseAddingProductsUntilReachMinspendThreshold(minSpendThreshold, currentProductIndex + 1, totalProductCount, apiProductSearchResultSetAsReference)
        }
      })
    } 
  }

  #increaseProductQuantityUntilReachMinSpendThreshold(minSpendThreshold, shelfProductTileElement)
  {
    cy.wait(1000)
    onSideCartPage.getTotalAmountElementOnHeader().then(totalAmountEle => {
      if(Number(totalAmountEle.text().substring(1)) < Number(minSpendThreshold)) {
        cy.wrap(shelfProductTileElement).find('.cartControls-incrementButton').then(incrementButton => {
          if(!incrementButton.prop('disabled')){
            cy.wrap(incrementButton).click({force : true})
            this.#increaseProductQuantityUntilReachMinSpendThreshold(minSpendThreshold, shelfProductTileElement)
          }
        })   
      }
    })
  }

  getcategoryHeaderNavLink () {
    return cy.get('a.categoryHeader-navigationLink[href="/shop/browse/coffee-tea"]')
  }
  
  getcategoryMenuHeaderLink () {
    return cy.get('a.categoryHeader-menuHeaderLink[href="/shop/browse/coffee-tea"]')
  }

  getNavItemLink () {
    return cy.get("a.navigation-item-link")
  }
  
  getPageBrowseTitle () {
    return cy.get('h1.browseContainer-title')
  }
  
  getFilterButtonElement () {
    return cy.get('wow-search-filter button.searchFilter-expandButton')
  }
  
  getFilterButtonText () {
    return cy.get("h2.searchFilter-expandButtonText")
  }

  getSortByLabel () {
    return cy.get("label.inline-dropdown__label")
  }

  getShelfProductTile () {
    return cy.get('shared-product-tile > shared-product-tile-v1 > .shelfProductTile')
  }

  getShelfProductTileTitle () {
    return cy.get("h1.shelfProductTile-title")
  }

  getQtyInputFieldProductTile () {
    return cy.get(".cartControls-quantityInput:visible")
  }
  
}

export const onSearchResultsPage = new SearchResultsPage()
