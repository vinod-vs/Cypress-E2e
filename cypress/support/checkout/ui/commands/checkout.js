import { onCheckoutPage } from '../pageObjects/CheckoutPage'
import '../../../utilities/ui/utility'

Cypress.Commands.add('selectAnyAvailableDeliveryTimeSlotAndSave', () => {
  // Need to wait for the delivery slots to be visible
  cy.wait(Cypress.config('twoSecondWait'))
  cy.checkIfElementExists(onCheckoutPage.getDeliveryDayLocatorString()).then((deliverySlotsPresent) => {
    // cy.log(deliverySlotAlreadySelected)
    // if (deliverySlotAlreadySelected == false) {
    cy.log('DeliverySlotsPresent: ' + deliverySlotsPresent)
    if (deliverySlotsPresent === true) {
      cy.log('Delivery slots not already selected. Selecting now.')
      cy.wait(Cypress.config('oneSecondWait'))

      // Find an available day from all days
      cy.get(onCheckoutPage.getDeliveryDayLocatorString()).each((day, index, $list) => {
        cy.log('Selecting the available date : ' + day.text())
        cy.wrap(day).find(onCheckoutPage.getDeliveryInfoLocatorString()).click()
        cy.wait(Cypress.config('twoSecondWait'))
        cy.wrap(day).should('have.class', 'selected')

        // Find an available time slot from all time slots
        cy.get(onCheckoutPage.getDeliveryTimeLocatorString()).each((time, index, $list) => {
          cy.log('Selecting the available time slot : ' + time.text())
          cy.wrap(time).find(onCheckoutPage.getDeliveryTimeSpanLocatorString()).click()
          cy.wait(Cypress.config('twoSecondWait'))
          cy.wrap(time).should('have.class', 'selected')

          // Click time slot save details
          cy.wait(Cypress.config('oneSecondWait'))
          cy.scrollTo('bottom')
          cy.wait(Cypress.config('oneSecondWait'))
          cy.saveGroceriesDeliveryTimeDetails()
          cy.wait(Cypress.config('oneSecondWait'))
          return false
        })
        return false
      })
    }
  })
})

Cypress.Commands.add('saveGroceriesDeliveryTimeDetails', () => {
  // Click time slot save details
  cy.scrollTo('bottom')
  cy.wait(Cypress.config('oneSecondWait'))
  onCheckoutPage.getSaveDetailsButton().click({ multiple: true })
  cy.wait(Cypress.config('oneSecondWait'))

  // Verify details are saved
  onCheckoutPage.getGroceriesEstimatedTimeOfDelivery().should('be.visible')
})

Cypress.Commands.add('saveItemsReviewDetails', () => {
  // Click time slot save details
  cy.scrollTo('bottom')
  cy.wait(Cypress.config('oneSecondWait'))
  onCheckoutPage.getSaveDetailsButton().click({ multiple: true })
  cy.wait(Cypress.config('oneSecondWait'))

  // Verify details are saved
  onCheckoutPage.getItemsSavedConfirmationElement().should('be.visible')
})

Cypress.Commands.add('clickPlaceOrder', () => {
  // Click place order
  onCheckoutPage.getPlaceOrderButton().click()
  cy.wait(Cypress.config('oneSecondWait'))
})

Cypress.Commands.add('getShippingFeesFromUI', (testData) => {
  cy.checkIfElementExists(onCheckoutPage.getGroceriesDeliverySaleFeeLocatorString()).then((isSaleDeliveryFeePresent) => {
    if (isSaleDeliveryFeePresent === true) {
      cy.getTextFromElement(onCheckoutPage.getGroceriesDeliverySaleFeeLocatorString()).then((saleDeliveryFee) => {
        const value = String(saleDeliveryFee).split('$')[1]
        testData.totalWowShippingFee = value
        cy.log('Groceries sale shipping fees: ' + value)
        expect(value).to.not.be.a('null')
        expect(value).to.not.be.a('')
      })
    } else {
      cy.getTextFromElement(onCheckoutPage.getGroceriesDeliveryFeeLocatorString()).then((regularDeliveryFee) => {
        const value = String(regularDeliveryFee).split('$')[1]
        testData.totalWowShippingFee = value
        cy.log('Groceries normal shipping fees: ' + value)
        expect(value).to.not.be.a('null')
        expect(value).to.not.be.a('')
      })
    }
  })

  cy.checkIfElementExists(onCheckoutPage.getEMDeliveryFeeLocatorString1()).then((isEMDeliveryFeePresent) => {
    if (isEMDeliveryFeePresent === true) {
      cy.getTextFromElement(onCheckoutPage.getEMDeliveryFeeLocatorString1()).then((eMDeliveryFee) => {
        const value = String(eMDeliveryFee).split('$')[1]
        testData.totalEMShippingFee = value
        cy.log('EM shipping fees: ' + value)
        expect(value).to.not.be.a('null')
        expect(value).to.not.be.a('')
      })
    }
  })
})

Cypress.Commands.add('verifyAmounts', (testData) => {
  // Calculate the toal amounts of WOW and EM
  const items = testData.items
  let wowTotalAmount = new Number(0)
  let emTotalAmount = new Number(0)
  items.forEach(item => {
    if (item.isEMProduct === 'true') {
      emTotalAmount = Number(emTotalAmount) + Number(item.quantity) * Number(item.pricePerItem) - Number(item.promoPrice)
    } else {
      wowTotalAmount = Number(wowTotalAmount) + Number(item.quantity) * Number(item.pricePerItem) - Number(item.promoPrice)
    }
  })
  testData.wowTotalAmount = Number(wowTotalAmount.toFixed(2))
  testData.emTotalAmount = Number(emTotalAmount.toFixed(2))
  cy.log('EM TotalAmount: ' + Number(testData.emTotalAmount) + ', WOW TotalAmount: ' + Number(testData.wowTotalAmount))

  // Calculate order total
  let totalAmount = new Number(0)
  totalAmount = Number(testData.wowTotalAmount) + Number(testData.totalWowShippingFee) + Number(testData.emTotalAmount) + Number(testData.totalEMShippingFee) + Number(testData.reusableBagsFee) - Number(testData.orderDiscount)
  testData.orderTotal = Number(totalAmount.toFixed(2))
  cy.log('Order Total: ' + Number(testData.orderTotal))

  cy.log(JSON.stringify(testData))
  // verify the amounts and shipping fees
  onCheckoutPage.getWoolworthsItemsShippingFee().should('include.text', testData.totalWowShippingFee)
  onCheckoutPage.getWoolworthsItemsSubtotal().should('include.text', testData.wowTotalAmount)
  onCheckoutPage.getMarketItemsShippingFee().should('include.text', testData.totalEMShippingFee)
  onCheckoutPage.getMarketItemsSubtotal().should('include.text', testData.emTotalAmount)
  onCheckoutPage.getReusableBagsFee().should('include.text', testData.reusableBagsFee)
  onCheckoutPage.getTotalOrderAmount().should('include.text', testData.orderTotal)
  // checkoutPage.getTotalOrderAmount().should('include.text', Number(testData.wowTotalAmount) + Number(testData.totalWowShippingFee) + Number(testData.emTotalAmount) + Number(testData.totalEMShippingFee) + Number(testData.reusableBagsFee))
})

Cypress.Commands.add('getResuableBagsAmount', (testData) => {
  let reusableBagsFeeVar = new Number(0)
  cy.get(onCheckoutPage.getReusableBagsFeeLocatorString()).then(function (textElement) {
    reusableBagsFeeVar = textElement.text().toString().split('$')[1]
    testData.reusableBagsFee = reusableBagsFeeVar
    cy.log('ReusableBagsFee: ' + testData.reusableBagsFee)
  })
})

Cypress.Commands.add('getDiscountAmountIfAny', (testData) => {
  cy.checkIfElementExists(onCheckoutPage.getOrderDiscountLocatorString()).then((isOrderDiscountPresent) => {
    if (isOrderDiscountPresent === true) {
      cy.getTextFromElement(onCheckoutPage.getOrderDiscountLocatorString()).then((orderDiscount) => {
        const value = String(orderDiscount).split('$')[1]
        testData.orderDiscount = value
        cy.log('Order Discount was present: ' + value)
      })
    }
  })
})
