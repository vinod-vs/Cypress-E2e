import DeliveryDateAndWindowPage from '../pageObjects/DeliveryDateAndWindowPage'
import listInput from '../../../../fixtures/lists/listUITest.json'

const deliveryDateAndWindowPage = new DeliveryDateAndWindowPage()

Cypress.Commands.add('selectDeliveryDateAndWindow', () => {
  deliveryDateAndWindowPage.getChangeTradingAccountLink().click()

  deliveryDateAndWindowPage.getSelectTradingAccount().click()

  deliveryDateAndWindowPage.getSelectOneOftheTradingAccounts().click()

  deliveryDateAndWindowPage.getSelectTradingAccount().should('have.value', listInput.trading_acc_address)

  deliveryDateAndWindowPage.getSaveAndContinueButton().click() 

  deliveryDateAndWindowPage.getSelectDate()  

  deliveryDateAndWindowPage.getthefirsttimeslot().check({force: true})
  
  deliveryDateAndWindowPage.getContinueShoppingButton().click()
})
