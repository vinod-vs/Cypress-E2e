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

Cypress.Commands.add('getShippingFeesFromUI', (testData) => {

  cy.checkIfElementExists(checkoutPage.getGroceriesDeliverySaleFeeLocatorString()).then((isSaleDeliveryFeePresent) => {
    if (isSaleDeliveryFeePresent == true) {
      cy.getTextFromElement(checkoutPage.getGroceriesDeliverySaleFeeLocatorString()).then((saleDeliveryFee) => {
        let value = String(saleDeliveryFee).split('$')[1]
        testData.totalWowShippingFee = value
        cy.log('Groceries sale shipping fees: ' + value)
      })
    } else {
      cy.getTextFromElement(checkoutPage.getGroceriesDeliveryFeeLocatorString()).then((regularDeliveryFee) => {
        let value = String(regularDeliveryFee).split('$')[1]
        testData.totalWowShippingFee = value
        cy.log('Groceries normal shipping fees: ' + value)
      })
    }
  })

  cy.checkIfElementExists(checkoutPage.getEMDeliveryFeeLocatorString()).then((isEMDeliveryFeePresent) => {
    if (isEMDeliveryFeePresent == true) {
      cy.getTextFromElement(checkoutPage.getEMDeliveryFeeLocatorString()).then((eMDeliveryFee) => {
        let value = String(eMDeliveryFee).split('$')[1]
        testData.totalEMShippingFee = value
        cy.log('EM shipping fees: ' + value)
      })
    }
  })
})

Cypress.Commands.add('verifyAmounts', (testData) => {

  //Calculate the toal amounts of WOW and EM
  const items = testData.items
  let wowTotalAmount = new Number(0)
  let emTotalAmount = new Number(0)
  items.forEach(item => {
    if (item.isEMProduct == 'true') {
      emTotalAmount = Number(emTotalAmount) + Number(item.quantity) * Number(item.pricePerItem)
    } else {
      wowTotalAmount = Number(wowTotalAmount) + Number(item.quantity) * Number(item.pricePerItem)
    }
  })
  testData.wowTotalAmount = wowTotalAmount
  testData.emTotalAmount = emTotalAmount
  cy.log('EM TotalAmount: ' + testData.emTotalAmount + ', WOW TotalAmount: ' + testData.wowTotalAmount)

  //Calculate order total 
  let totalAmount = new Number(0)
  totalAmount = Number(testData.wowTotalAmount) + Number(testData.totalWowShippingFee) + Number(testData.emTotalAmount) + Number(testData.totalEMShippingFee) + Number(testData.reusableBagsFee)
  testData.orderTotal = totalAmount
  cy.log('Order Total: ' + testData.orderTotal)

  //verify the amounts and shipping fees
  checkoutPage.getWoolworthsItemsShippingFee().should('include.text', testData.totalWowShippingFee)
  checkoutPage.getWoolworthsItemsSubtotal().should('include.text', testData.wowTotalAmount)
  checkoutPage.getMarketItemsShippingFee().should('include.text', testData.totalEMShippingFee)
  checkoutPage.getMarketItemsSubtotal().should('include.text', testData.emTotalAmount)
  checkoutPage.getReusableBagsFee().should('include.text', testData.reusableBagsFee)
  //checkoutPage.getTotalOrderAmount().should('include.text', test.orderTotal)
  checkoutPage.getTotalOrderAmount().should('include.text', Number(testData.wowTotalAmount) + Number(testData.totalWowShippingFee) + Number(testData.emTotalAmount) + Number(testData.totalEMShippingFee) + Number(testData.reusableBagsFee))
})

Cypress.Commands.add('getResuableBagsAmount', (testData) => {

  let reusableBagsFeeVar = new Number(0)
  cy.get(checkoutPage.getReusableBagsFeeLocatorString()).then(function (textElement) {
    reusableBagsFeeVar = Number(textElement.text().toString().split('$')[1])
    testData.reusableBagsFee = Number(reusableBagsFeeVar)
    cy.log('ReusableBagsFee: ' + testData.reusableBagsFee)
  })
})