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
}

export const onHomePage = new HomePage()
