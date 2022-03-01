export class HomePage {
  getMyAccount() {
    return cy.get('.coreHeader-account-wide')
  }

  getB2BMyAccount() {
    return cy.get('#header-panel a.coreHeader-signupButton')
  }

  getSearchHeader() {
    return cy.get('.headerSearch-searchBox')
  }

  getClearSearchHeader() {
    return cy.get('.headerSearch-actionButton')
  }

  getCartAmount() {
    return cy.get('.orderAmount')
  }

  getListsLink() {
    return cy.get('a.coreHeaderNav-link[href="/shop/mylists"]')
  }

  getLogoLink() {
    return cy.get('a[erlabel="homepage icon"]')
  }

  getViewCartButton() {
    return cy.get('#viewCartPanel > .button')
  }

}

export const onHomePage = new HomePage()