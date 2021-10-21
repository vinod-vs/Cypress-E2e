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

  getSelectTradingAccount () {
    return cy.get('#deliveryAddressSelector')
  }

  getSelectOneOftheTradingAccounts () {
    return cy.get('#deliveryAddressSelector-option2')
  }

  getSaveAndContinueButton () {
    return cy.get('button.shopper-action span')
  }

  getSelectDate () {
    return cy.get('select.day-dropdown').select('2: Object')
  }

  getthefirsttimeslot () {
    return cy.get('input.wowRadio').first()
  }

  getContinueShoppingButton () {
    return cy.get('button.shopper-action').contains('Continue shopping')
  }
}

export const onDeliveryDateAndWindowPage = new DeliveryDateAndWindowPage()
