export class HomePage {
    getMyAccount () {
      return cy.get('.coreHeader-profile-content .coreHeader-profile-text')
    }
  
    getB2BMyAccount () {
      return cy.get('#header-panel a.coreHeader-signupButton')
    }

    getSearchHeader () {
      return cy.get('.headerSearch-searchBox')
    }
  
    getClearSearchHeader () {
      return cy.get('.headerSearch-actionButton')
    }
  
    getCartAmount () {
      return cy.get('.orderAmount')
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
      return cy.get('.categoryHeader-navigation .categoryHeader-navigationLink:nth-child(2)')
    }
  
    getCategoryMenuItemLinks(){
      return cy.get('.categoryHeader-navigation>a')
    }
    
    getSubMenuItemLinks () {
      return cy.get('.categoriesNavigation-list > li > a')
    }
  
    getCartAmountInHeader () {
      return cy.get('.orderAmount')
    }
  }
  
  export const onHomePage = new HomePage()