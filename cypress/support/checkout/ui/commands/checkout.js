import CheckoutPage from '../pageObjects/CheckoutPage'
import '../../../utilities/ui/utility'

const checkoutPage = new CheckoutPage()

Cypress.Commands.add('selectAnyDeliveryTimeSlot', () => {

  cy.wait(Cypress.config('oneSecondWait'))
  //Select deliver day and time only if its not already selected
  cy.checkIfElementExists(checkoutPage.getGroceriesEstimatedTimeOfDeliveryLocatorString()).then((returnedValue) => {
    if (returnedValue == false) {
      checkoutPage.getThirdDayDeliverySlot().click()
      cy.wait(Cypress.config('oneSecondWait'))
      //checkoutPage.getThirdDayDeliveryTwoToFiveSlot().click()
      checkoutPage.getThirdDayDeliveryFourToSevenSlot().click()
      cy.wait(Cypress.config('oneSecondWait'))
      cy.scrollTo('bottom')
      cy.wait(Cypress.config('oneSecondWait'))

      // Click time slot save details
      cy.saveGroceriesDeliveryTimeDetails()
    }
  })
})

Cypress.Commands.add('saveGroceriesDeliveryTimeDetails', () => {
  // Click time slot save details
  cy.scrollTo('bottom')
  cy.wait(Cypress.config('oneSecondWait'))
  checkoutPage.getSaveDetailsButton().click({ multiple: true })
  cy.wait(Cypress.config('oneSecondWait'))

  // Verify details are saved
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

Cypress.Commands.add('getShippingFeesFromUI', (test) => {

  cy.checkIfElementExists(checkoutPage.getGroceriesDeliverySaleFeeLocatorString()).then((returnedValue) => {
    if (returnedValue == true) {
      cy.getTextFromElement(checkoutPage.getGroceriesDeliverySaleFeeLocatorString()).then((returnedValue) => {
        let value = String(returnedValue).split('$')[1]
        test.totalWowShippingFee = value
        cy.log('Groceries sale shipping fees: ' + value)
      })
    } else {
      cy.getTextFromElement(checkoutPage.getGroceriesDeliveryFeeLocatorString()).then((returnedValue) => {
        let value = String(returnedValue).split('$')[1]
        test.totalWowShippingFee = value
        cy.log('Groceries normal shipping fees: ' + value)
      })
    }
  })

  cy.checkIfElementExists(checkoutPage.getEMDeliveryFeeLocatorString()).then((returnedValue) => {
    if (returnedValue == true) {
      cy.getTextFromElement(checkoutPage.getEMDeliveryFeeLocatorString()).then((returnedValue) => {
        let value = String(returnedValue).split('$')[1]
        test.totalEMShippingFee = value
        cy.log('EM shipping fees: ' + value)
      })
    }
  })
})

Cypress.Commands.add('verifyAmounts', (test) => {

  //Calculate the toal amounts of WOW and EM
  const items = test.items
  var wowTotalAmount = new Number(0)
  var emTotalAmount = new Number(0)
  items.forEach(item => {
    if (item.isEMProduct == 'true') {
      emTotalAmount = Number(emTotalAmount) + Number(item.quantity) * Number(item.pricePerItem)
    } else {
      wowTotalAmount = Number(wowTotalAmount) + Number(item.quantity) * Number(item.pricePerItem)
    }
  })
  test.wowTotalAmount = wowTotalAmount
  test.emTotalAmount = emTotalAmount
  cy.log('EM TotalAmount: ' + test.emTotalAmount + ', WOW TotalAmount: ' + test.wowTotalAmount)

  //Calculate order total 
  var totalAmount = new Number(0)
  totalAmount = Number(test.wowTotalAmount) + Number(test.totalWowShippingFee) + Number(test.emTotalAmount) + Number(test.totalEMShippingFee) + Number(test.reusableBagsFee)
  test.orderTotal = totalAmount
  cy.log('Order Total: ' + test.orderTotal)

  //verify the amounts and shipping fees
  checkoutPage.getWoolworthsItemsShippingFee().should('include.text', test.totalWowShippingFee)
  checkoutPage.getWoolworthsItemsSubtotal().should('include.text', test.wowTotalAmount)
  checkoutPage.getMarketItemsShippingFee().should('include.text', test.totalEMShippingFee)
  checkoutPage.getMarketItemsSubtotal().should('include.text', test.emTotalAmount)
  checkoutPage.getReusableBagsFee().should('include.text', test.reusableBagsFee)
  //checkoutPage.getTotalOrderAmount().should('include.text', test.orderTotal)
  checkoutPage.getTotalOrderAmount().should('include.text', Number(test.wowTotalAmount) + Number(test.totalWowShippingFee) + Number(test.emTotalAmount) + Number(test.totalEMShippingFee) + Number(test.reusableBagsFee))
})

Cypress.Commands.add('getResuableBagsAmount', (test) => {

  var reusableBagsFeeVar = new Number(0)
  cy.get(checkoutPage.getReusableBagsFeeLocatorString()).then(function (textElement) {
    reusableBagsFeeVar = Number(String(textElement.text()).split('$')[1])
    test.reusableBagsFee = Number(reusableBagsFeeVar)
    cy.log('ReusableBagsFee: ' + test.reusableBagsFee)
  })
})