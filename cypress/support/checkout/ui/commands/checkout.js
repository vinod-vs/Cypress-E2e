import CheckoutPage from '../pageObjects/CheckoutPage'

const checkoutPage = new CheckoutPage()

Cypress.Commands.add('selectAnyDeliveryTimeSlot', () => {
  // Select third delivery slot
  checkoutPage.getThirdDayDeliverySlot().click()
  cy.wait(Cypress.config('oneSecondWait'))
  checkoutPage.getThirdDayDeliveryTwoToFiveSlot().click()
  cy.wait(Cypress.config('oneSecondWait'))
  cy.scrollTo('bottom')
  cy.wait(Cypress.config('oneSecondWait'))

  // Click time slot save details
  cy.saveGroceriesDeliveryTimeDetails()
})

Cypress.Commands.add('saveGroceriesDeliveryTimeDetails', () => {
  // Click time slot save details
  cy.scrollTo('bottom')
  cy.wait(Cypress.config('oneSecondWait'))
  checkoutPage.getSaveDetailsButton().click({ multiple: true })
  cy.wait(Cypress.config('oneSecondWait'))

  // Verify details are saved
  // checkoutPage.getDeliveryTimeSlotSavedConfirmationElement().should('be.visible')
  checkoutPage.getGroceriesEstimatedTimeOfDelivery().should('be.visible')
})

Cypress.Commands.add('saveItemsReviewDetails', () => {
  // Click time slot save details
  cy.scrollTo('bottom')
  cy.wait(Cypress.config('oneSecondWait'))
  checkoutPage.getSaveDetailsButton().click({ multiple: true })
  cy.wait(Cypress.config('oneSecondWait'))

  // Verify details are saved
  checkoutPage.getItemsSavedConfirmationElement().should('be.visible')
})

Cypress.Commands.add('clickPlaceOrder', () => {
  // Click place order
  checkoutPage.getPlaceOrderButton().click()
  cy.wait(Cypress.config('oneSecondWait'))
})
