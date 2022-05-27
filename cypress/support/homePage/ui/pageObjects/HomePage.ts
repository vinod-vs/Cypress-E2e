export class HomePage {
  loadHomePage () {
    cy.visit('.')
  }

  getMyAccount () {
    return cy.get('#wx-link-login-desktop span.coreHeader-profile-text')
  }

  getB2BMyAccount () {
    return cy.get('#header-panel a[href="/shop/myaccount/details"]')
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

  getViewCart () {
    return cy.get('#wx-label-checkout-action')
    
   }

   getItemnotFound() {
     return cy.get('.no-results-primary-text')
     
   }
  getSecondCategoryMenuItem () {
    return cy.get('.categoryHeader-navigation .categoryHeader-navigationLink:nth-child(2)')
  }

  getCategoryMenuItemLinks () {
    return cy.get('.categoryHeader-navigation>a')
  }

  getSubMenuItemLinks () {
    return cy.get('.categoriesNavigation-list > li > a')
  }

  getCartAmountInHeader () {
    return cy.get('.orderAmount')
  }
  okgotit () {
    return cy.get('.productSaveToList-coachMark-coachMarkConfirm ng-tns-c66-13')
  }

  getDiscoverCenterLinkB2B (){
   return cy.get('a.coreHeaderNav-link[href="/shop/discover/centre"]')
  }

}

export const onHomePage = new HomePage()
