import { onDeliveryDateAndWindowPage } from '../pageObjects/DeliveryDateAndWindowPage'
import { onCheckoutPage } from '../../../checkout/ui/pageObjects/CheckoutPage'
import '../../../utilities/ui/utility'
import { windowType } from '../../../../../cypress/fixtures/checkout/fulfilmentWindowType'
import '../../../../support/shared/api/commands/bootstrap'

Cypress.Commands.add('selectDeliveryDateAndWindow', (tradingAccAddress) => {
  // Wait for the FMS page to load before checking whether shopping Preferences is saved
  cy.wait(Cypress.config('twoSecondWait'))

  cy.checkIfElementExists(onDeliveryDateAndWindowPage.getTodaysShoppingPreferenceLocatorString()).then((shoppingPrefernceExists) => {
    if (shoppingPrefernceExists === true) {
      onDeliveryDateAndWindowPage.getChangeTradingAccountLink().click()
    }
  })

  onDeliveryDateAndWindowPage.getSelectTradingAccountList().click()

  onDeliveryDateAndWindowPage.getTheFirstTradingAccount().click()

  onDeliveryDateAndWindowPage.getSaveAndContinueButton().click()

  onDeliveryDateAndWindowPage.getSelectDate()

  onDeliveryDateAndWindowPage.getthefirsttimeslot().check({ force: true })

  onDeliveryDateAndWindowPage.getContinueShoppingButton().click()
})

Cypress.Commands.add('selectRandomWindowInCheckout', (fulfilmentType, fulfilmentWindowType) => {
  cy.getBootstrapResponse().then((response) => {
    const areaId = response.GetDeliveryInfoRequest.Address.AreaId
    const addressId = response.GetDeliveryInfoRequest.Address.AddressId
    const suburbId = response.GetDeliveryInfoRequest.Address.SuburbId

    cy.getRandomAvailableWindowViaApi(addressId, areaId, suburbId, fulfilmentType, fulfilmentWindowType)
  })
    .then((window) => {
      const todayDate = new Date()
      let dayToSelect
      const today = 'Today'
      const tomorrow = 'Tomorrow'
      const windowStartDate = new Date(window.StartDateTime)
      const windowEndDate = new Date(window.EndDateTime)

      if (fulfilmentWindowType !== windowType.DELIVERY_NOW) {
        if (todayDate.getDay() === windowStartDate.getDay()) {
          dayToSelect = today
        } else if ((todayDate.getDay() + 1) === windowStartDate.getDay()) {
          dayToSelect = tomorrow
        }

        if (dayToSelect === today || dayToSelect === tomorrow) {
          cy.formatToAmPm(windowStartDate).then(($startTime) => {
            cy.formatToAmPm(windowEndDate).then(($endTime) => {
              onCheckoutPage.onCheckoutWindowTimePanel.onCheckoutTimeSlotSelector.selectWindow(dayToSelect, $startTime + ' to ' + $endTime)
            })
          })
        } else { // Named days, e.g. Wednesday
          cy.getDayOfWeek(windowStartDate).then((day) => {
            cy.formatToAmPm(windowStartDate).then(($startTime) => {
              cy.formatToAmPm(windowEndDate).then(($endTime) => {
                onCheckoutPage.onCheckoutWindowTimePanel.onCheckoutTimeSlotSelector.selectWindow(day, $startTime + ' to ' + $endTime)
              })
            })
          })
        }
      } else if (fulfilmentWindowType === windowType.DELIVERY_NOW) {
        dayToSelect = today
        onCheckoutPage.onCheckoutWindowTimePanel.onCheckoutTimeSlotSelector.selectWindow(dayToSelect, window.TimeWindow)
      }
    })
})
