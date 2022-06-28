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
              onCheckoutPage.onCheckoutFulfilmentWindowPanel.inCheckoutTimeSlotSelector.selectWindow(dayToSelect, $startTime + ' to ' + $endTime)
            })
          })
        } else { // Named days, e.g. Wednesday
          cy.getDayOfWeek(windowStartDate).then((day) => {
            cy.formatToAmPm(windowStartDate).then(($startTime) => {
              cy.formatToAmPm(windowEndDate).then(($endTime) => {
                onCheckoutPage.onCheckoutFulfilmentWindowPanel.inCheckoutTimeSlotSelector.selectWindow(day, $startTime + ' to ' + $endTime)
              })
            })
          })
        }
      } else if (fulfilmentWindowType === windowType.DELIVERY_NOW) {
        dayToSelect = today
        onCheckoutPage.onCheckoutFulfilmentWindowPanel.inCheckoutTimeSlotSelector.selectWindow(dayToSelect, window.TimeWindow)
      }
    })
})


Cypress.Commands.add("selectAvailableDeliveryDetailsOnFms", (tradingAccAddress) => {
  cy.wait(Cypress.config("twoSecondWait"));

  cy.checkIfElementExists(onDeliveryDateAndWindowPage.getTodaysShoppingPreferenceLocatorString()).then((shoppingPrefernceExists) => {
    if (shoppingPrefernceExists === true) {
      onDeliveryDateAndWindowPage.getChangeTradingAccountLink().click();
    }
  });
  onDeliveryDateAndWindowPage.getSelectTradingAccountList().click();
  onDeliveryDateAndWindowPage.getTheFirstTradingAccount().click();
  onDeliveryDateAndWindowPage.getSaveAndContinueButton().click();
  cy.wait(Cypress.config("twoSecondWait"));

  //Select first available day
  let deliveryDay = false
  onDeliveryDateAndWindowPage.getAvailableDays().each(($day, index) => {
    if (!$day.text().includes('Closed') && deliveryDay == false) {
      deliveryDay = true
      onDeliveryDateAndWindowPage.getGivenAvailableDay(index + 1)
      cy.log('Selected delivery day : ' + $day.text())
    }
  }).then(() => {
    if (deliveryDay == false) {
      throw new Error('Delivery days not available to select')
    }
  })
  onDeliveryDateAndWindowPage.getthefirsttimeslot().check({ force: true });
  onDeliveryDateAndWindowPage.getContinueShoppingButton().click();
});

Cypress.Commands.add("selectAvailablePickUpDetailsOnFms", (pickUpAddress) => {
  cy.wait(Cypress.config("twoSecondWait"));

  cy.checkIfElementExists(onDeliveryDateAndWindowPage.getTodaysShoppingPreferenceLocatorString()).then((shoppingPrefernceExists) => {
    if (shoppingPrefernceExists === true) {
      onDeliveryDateAndWindowPage.getChangeTradingAccountLink().click();
    }
  });
  onDeliveryDateAndWindowPage.getPickupTabButton().click();
  onDeliveryDateAndWindowPage.getSelectTradingAccountList().click();
  onDeliveryDateAndWindowPage.getTheFirstTradingAccount().click();
  onDeliveryDateAndWindowPage.getPickUpAddressInput().click().clear().type('Armidale');
  onDeliveryDateAndWindowPage.getSelectPickUpAddressMatchingSearchResult().click();
  onDeliveryDateAndWindowPage.getSelectFirstPickUpAddressStore().click();
  onDeliveryDateAndWindowPage.getSaveAndContinueButton().click();
  cy.wait(Cypress.config("twoSecondWait"));

  //Select first available day
  let deliveryDay = false
  onDeliveryDateAndWindowPage.getAvailableDays().each(($day, index) => {
    if (!$day.text().includes('Closed') && deliveryDay == false) {
      deliveryDay = true
      onDeliveryDateAndWindowPage.getGivenAvailableDay(index + 1)
      cy.log('Selected delivery day : ' + $day.text())
    }
  }).then(() => {
    if (deliveryDay == false) {
      throw new Error('Delivery days not available to select')
    }
  })
  onDeliveryDateAndWindowPage.getthefirsttimeslot().check({ force: true });
  onDeliveryDateAndWindowPage.getContinueShoppingButton().click();
});

Cypress.Commands.add("selectAvailableDirectToBootDetailsOnFms", (directToBootAddress) => {
  cy.wait(Cypress.config("twoSecondWait"));

  cy.checkIfElementExists(onDeliveryDateAndWindowPage.getTodaysShoppingPreferenceLocatorString()).then((shoppingPrefernceExists) => {
    if (shoppingPrefernceExists === true) {
      onDeliveryDateAndWindowPage.getChangeTradingAccountLink().click();
    }
  });
  onDeliveryDateAndWindowPage.getDirectToBootTabButton().click();
  onDeliveryDateAndWindowPage.getAddressTypeHeadingText().contains('Choose a Direct to boot store')
  onDeliveryDateAndWindowPage.getSelectTradingAccountList().click();
  onDeliveryDateAndWindowPage.getTheFirstTradingAccount().click();
  onDeliveryDateAndWindowPage.getPickUpAddressInput().click().clear().type('Castle Hill');
  onDeliveryDateAndWindowPage.getSelectPickUpAddressMatchingSearchResult().click();
  onDeliveryDateAndWindowPage.getSelectFirstPickUpAddressStore().click();
  onDeliveryDateAndWindowPage.getSaveAndContinueButton().click();
  cy.wait(Cypress.config("twoSecondWait"));

  //Select first available day
  let deliveryDay = false
  onDeliveryDateAndWindowPage.getAvailableDays().each(($day, index) => {
    if (!$day.text().includes('Closed') && deliveryDay == false) {
      deliveryDay = true
      onDeliveryDateAndWindowPage.getGivenAvailableDay(index + 1)
      cy.log('Selected delivery day : ' + $day.text())
    }
  }).then(() => {
    if (deliveryDay == false) {
      throw new Error('Delivery days not available to select')
    }
  })
  onDeliveryDateAndWindowPage.getthefirsttimeslot().check({ force: true });
  onDeliveryDateAndWindowPage.getContinueShoppingButton().click();
});