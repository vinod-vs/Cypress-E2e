export class HomePage {
    getMyAccount () {
      return cy.get('#header-panel a.coreHeader-signupButton')
    }
  
    getSearchHeader () {
      return cy.get('#headerSearch')
    }
  
    getClearSearchHeader () {
      return cy.get('.headerSearch-actionButton')
    }
  
    getCartAmount () {
      return cy.get('.headerCheckout-orderAmount')
    }
  
    getListsLink () {
      return cy.get('a.coreHeaderNav-link[href="/shop/mylists"]')
    }
  
    getLogoLink () {
      return cy.get('a[erlabel="homepage icon"]')             
    }

    getViewCartButton () {
        return cy.get('#viewCartPanel > .button')
    }
    getSecondCategoryMenuItem () {
      return cy.get('a.categoryHeader-navigationLink.ng-star-inserted:nth-child(2)')
    }
  
    getCategoryMenuItemLinks(){
      return cy.get('.categoryHeader-navigation>a')
    }
    
    getSubMenuItemLinks () {
      return cy.get('.categoriesNavigation-list > li > a')
    }
  
    getSortProductsDropdownButton (){
      return cy.get('.inline-dropdown__selection__button')
    }
  
    getSortProductsDropdownOptionsSpan (){
      return cy.get('span.dropdown-item__button')
    }
  
    getCartAmountInHeader () {
      return cy.get('.headerCheckout-orderAmount')
    }
    // 'Price High to Low'
    sortProductsBy(sortByOrder: string) {
      onHomePage.getSecondCategoryMenuItem().click()
      cy.wait(2000)
      onHomePage.getSubMenuItemLinks().first().click()
      onHomePage.getSubMenuItemLinks().contains('Show All').click()
      //order by high price first
      onHomePage.getSortProductsDropdownButton().should('be.visible')
      onHomePage.getSortProductsDropdownButton().then(($sortDrpDwn)=>{
        if(!($sortDrpDwn.text().includes(sortByOrder))){
          onHomePage.getSortProductsDropdownButton().click()
          onHomePage.getSortProductsDropdownOptionsSpan().contains(sortByOrder).click()
        }
      })
    }
  }
  
  export const onHomePage = new HomePage()