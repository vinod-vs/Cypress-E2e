import DeliveryDateAndWindowPage from '../pageObjects/DeliveryDateAndWindowPage'
import '../../../utilities/ui/utility'

const deliveryDateAndWindowPage = new DeliveryDateAndWindowPage()

Cypress.Commands.add('selectDeliveryDateAndWindow', (tradingAccAddress) => {
  // Wait for the FMS page to load before checking whether shopping Preferences is saved
  cy.wait(Cypress.config('twoSecondWait'))

  cy.checkIfElementExists(deliveryDateAndWindowPage.getTodaysShoppingPreferenceLocatorString()).then((shoppingPrefernceExists) => {
    if (shoppingPrefernceExists === true) {
      deliveryDateAndWindowPage.getChangeTradingAccountLink().click()
    }
  })
  
  deliveryDateAndWindowPage.getSelectTradingAccount().click()

  deliveryDateAndWindowPage.getSelectOneOftheTradingAccounts().click()

  deliveryDateAndWindowPage.getSelectTradingAccount().should('have.value', tradingAccAddress)

  deliveryDateAndWindowPage.getSaveAndContinueButton().click()

  deliveryDateAndWindowPage.getSelectDate()

  deliveryDateAndWindowPage.getthefirsttimeslot().check({ force: true })

  deliveryDateAndWindowPage.getContinueShoppingButton().click()
})
