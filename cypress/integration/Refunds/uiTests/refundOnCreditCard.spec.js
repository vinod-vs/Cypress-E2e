import TestFilter from '../../../support/TestFilter.js'
import '../../../support/login/ui/commands/login.js'
import '../../../support/sideCart/ui/commands/clearTrolley.js'
import '../../../support/fulfilment/ui/commands/deliveryDateAndWindow.js'
import '../../../support/search/ui/commands/searchAndAddProduct.js'
import { onSearchResultsPage } from '../../../support/search/ui/pageObjects/SearchResultsPage.js'
import { onFMSRibbon } from '../../../support/fulfilment/ui/pageObjects/FMSRibbon.ts'
import { onFMSAddressSelector } from '../../../support/fulfilment/ui/pageObjects/FMSAddressSelector.ts'
import { onFMSWindowSelector } from '../../../support/fulfilment/ui/pageObjects/FMSWindowSelector.ts'
import { onSideCartPage } from '../../../support/sideCart/ui/pageObjects/SideCartPage.ts'
import { onHaveYouForgottenPage } from '../../../support/hyf/ui/pageObjects/HaveYouForgottenPage.ts'
import { onCheckoutPage } from '../../../support/checkout/ui/pageObjects/CheckoutPage.ts'
import { onOrderConfirmationPage } from '../../../support/orderConfirmation/ui/pageObjects/OrderConfirmationPage.ts'
import shoppers from '../../../fixtures/login/b2cShoppers.json'
import refundsTestData from '../../../fixtures/refunds/refundsTestData.json'


TestFilter(['B2C', 'UI', 'Refunds', 'OPS', 'P3'], () => {
  describe('[UI] Place an order, then refund the order', () => {
    before(() => {
          cy.clearCookies({ domain: null })
          cy.clearLocalStorage({ domain: null })
    })
    it('Place and refund order', () => {
      cy.loginViaUi(shoppers[4])
      onSideCartPage.cleanupTrolley()
      onFMSRibbon.getFMSRibbonAddressLink().click({waitForAnimations: false})
      onFMSAddressSelector.selectDeliveyAddress(refundsTestData.refundsOnCC.deliveryAddress)
      onFMSWindowSelector.selectAvailableDayAfterTomorrow()
      onFMSWindowSelector.selectLastTimeslot();
      onFMSWindowSelector.getContinueShoppingButton().click()
      onSearchResultsPage.addRandomProductsFromEachDepartmentToCartUntilReachSpendThreshold(refundsTestData.refundsOnCC.orderMinAmount)
      onSideCartPage.getViewCartButton().click()
      onSideCartPage.gotoCheckout()
      
      onHaveYouForgottenPage.continueToCheckout()
      
      onCheckoutPage.onCheckoutFulfilmentSelectionPanel.getSummarisedFulfilmentAddressElement().then(address => {
        cy.wrap(address.text()).as('expectedAddress')
      })

      onCheckoutPage.onCheckoutFulfilmentWindowPanel.getSummarisedFulfilmentDay().then(fulfilmentDay => {
        cy.wrap(fulfilmentDay).as('expectedFulfilmentDay')
      })

      onCheckoutPage.onCheckoutFulfilmentWindowPanel.getSummarisedFulfilmentTime().then(fulfilmentTime => {
        cy.wrap(fulfilmentTime).as('expectedFulfilmentTime')
      })

      onCheckoutPage.onCheckoutPaymentPanel.getPaymentTotalAmountElement().then(totalAmount => {
        cy.wrap(totalAmount.text()).as('expectedTotalAmount')
      })

      onCheckoutPage.onCheckoutPaymentPanel.payWithExistingCreditCard('1111', '405')

      // Verify order confirmation page
      onOrderConfirmationPage.getOrderConfirmationHeader().should('be.visible').and('have.text', 'Order received')
      cy.url().should('include', '/confirmation')

      cy.get('@expectedAddress').then(expectedAddress => {
        onOrderConfirmationPage.getConfirmationFulfilmentDetailsContentElement().should('contain.text', expectedAddress)
      })

      cy.get('@expectedFulfilmentDay').then(expectedFulfilmentDay => {
        onOrderConfirmationPage.getConfirmationFulfilmentDetailsContentElement().should('contain.text', expectedFulfilmentDay)
      })
      
      cy.get('@expectedFulfilmentTime').then(expectedFulfilmentTime => {
        onOrderConfirmationPage.getConfirmationFulfilmentDetailsContentElement().should('contain.text', expectedFulfilmentTime)
      })

      cy.get('@expectedTotalAmount').then(expectedTotalAmount => {
        onOrderConfirmationPage.getOrderPaymentSummaryTotalAmountElement().should('contain.text', expectedTotalAmount)
      })
    })
  })
})

