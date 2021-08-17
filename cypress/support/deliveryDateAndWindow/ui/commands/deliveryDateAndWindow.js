import DeliveryDateAndWindowPage from '../pageObjects/DeliveryDateAndWindowPage'

const deliveryDateAndWindowPage = new DeliveryDateAndWindowPage()

Cypress.Commands.add('selectDeliveryDateAndWindow', (tradingAccAddress) => {
  deliveryDateAndWindowPage.getChangeTradingAccountLink().click()

  deliveryDateAndWindowPage.getSelectTradingAccount().click()

  deliveryDateAndWindowPage.getSelectOneOftheTradingAccounts().click()

  deliveryDateAndWindowPage.getSelectTradingAccount().should('have.value', tradingAccAddress)

  deliveryDateAndWindowPage.getSaveAndContinueButton().click()

  deliveryDateAndWindowPage.getSelectDate()

  deliveryDateAndWindowPage.getthefirsttimeslot().check({ force: true })

  deliveryDateAndWindowPage.getContinueShoppingButton().click()
})
