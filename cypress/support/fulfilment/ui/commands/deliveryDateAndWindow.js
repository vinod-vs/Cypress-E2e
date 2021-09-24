import { onDeliveryDateAndWindowPage } from '../pageObjects/DeliveryDateAndWindowPage'
import '../../../utilities/ui/utility'

Cypress.Commands.add('selectDeliveryDateAndWindow', (tradingAccAddress) => {
  // Wait for the FMS page to load before checking whether shopping Preferences is saved
  cy.wait(Cypress.config('twoSecondWait'))

  cy.checkIfElementExists(onDeliveryDateAndWindowPage.getTodaysShoppingPreferenceLocatorString()).then((shoppingPrefernceExists) => {
    if (shoppingPrefernceExists === true) {
      onDeliveryDateAndWindowPage.getChangeTradingAccountLink().click()
    }
  })

  onDeliveryDateAndWindowPage.getSelectTradingAccount().click()

  onDeliveryDateAndWindowPage.getSelectOneOftheTradingAccounts().click()

  onDeliveryDateAndWindowPage.getSelectTradingAccount().should('have.value', tradingAccAddress)

  onDeliveryDateAndWindowPage.getSaveAndContinueButton().click()

  onDeliveryDateAndWindowPage.getSelectDate()

  onDeliveryDateAndWindowPage.getthefirsttimeslot().check({ force: true })

  onDeliveryDateAndWindowPage.getContinueShoppingButton().click()
})
