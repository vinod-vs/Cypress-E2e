export class DeliveryDateAndWindowPage {
  getWowfulfilmentMethodContainer () {
    return cy.get('wow-fulfilment-method-selector-container')
  }

  getTodaysShoppingPreferenceLocatorString () {
    return 'h3.selected-fulfilment-method--subHeading'
  }

  getChangeTradingAccountLink () {
    return cy.get('button.selected-fulfilment-method--editButton')
  }

  getSelectTradingAccountList () {
    return cy.get('#deliveryAddressSelector')
  }

  getTheFirstTradingAccount () {
    return cy.get('#deliveryAddressSelector-option0')
  }

  getSaveAndContinueButton () {
    return cy.get('button.shopper-action span')
  }

  getSelectDate () {
    return cy.get('select.day-dropdown').select('3: Object')
  }

  getthefirsttimeslot () {
    return cy.get('input.wowRadio').first()
  }

  getContinueShoppingButton () {
    return cy.get('button.shopper-action').contains('Continue shopping')
  }

  getAvailableDays () {
    return cy.get('option.ng-star-inserted')
  }

  getGivenAvailableDay (index: number ) {
    return cy.get('select.day-dropdown').select(index+': Object')
  }

  getPickupTabButton () {
    return cy.get('ul.tab-list >:nth-child(2) > .tab-button')
  }

  getPickUpAddressInput () {
    return cy.get('#pickupAddressSelector')
  }

  getSelectPickUpAddressMatchingSearchResult () {
    return cy.get('#pickupAddressSelector-option0')
  }

  getSelectFirstPickUpAddressStore () {
    return cy.get('.stores > :nth-child(1)')
  }

  getDirectToBootTabButton () {
    return cy.get('ul.tab-list >:nth-child(3) > .tab-button')
  }

  getAddressTypeHeadingText () {
    return cy.get('h4.pickup-address__heading')
  }
}

export const onDeliveryDateAndWindowPage = new DeliveryDateAndWindowPage()
