class CreditCardPage {
  getCreditCardSectionExpanded () {
    return cy.get('.creditCards-section > wow-digital-pay-toggle-instrument-type-button.ng-star-inserted > .toggle-button')
  }

  getCreditCardSectionCollapsed () {
    return cy.get('.creditCards-section > .ng-star-inserted > .toggle-button')
  }

  getCreditCardSectionExpandedLocatorString () {
    return '.creditCards-section > wow-digital-pay-toggle-instrument-type-button.ng-star-inserted > .toggle-button'
  }

  getCreditCardSectionCollapsedLocatorString () {
    return '.creditCards-section > .ng-star-inserted > .toggle-button'
  }

  getCreditCardNumber () {
    return cy.get('#card_number')
  }

  getCreditCardNumberLocatorString () {
    return '#card_number'
  }

  getCreditCardExpMonth () {
    return cy.get('#expiry_month')
  }

  getCreditCardExpMonthLocatorString () {
    return '#expiry_month'
  }

  getCreditCardExpYear () {
    return cy.get('#exp_year')
  }

  getCreditCardExpYearLocatorString () {
    return '#exp_year'
  }

  getCreditCardCVV () {
    return cy.get('#cvv_csv')
  }

  getCreditCardCVVLocatorString () {
    return '#cvv_csv'
  }

  getCreditCardIframeLocatorString () {
    return '.creditCardAdd-form > iframe'
  }

  getCreditCardCVVIframeLocatorString () {
    return '.cvv-iframe'
  }

  getCreditCardDetailAlreadySavedLocatorString () {
    return '.creditCardItem-content'
  }
}

export default CreditCardPage
