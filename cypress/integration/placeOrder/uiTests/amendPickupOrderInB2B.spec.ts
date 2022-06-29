/// <reference types="Cypress" />
import shopper from '../../../fixtures/login/b2bLogin.json'
import addressSearchBody from '../../../fixtures/checkout/addressSearch.json'
import creditCardPayment from '../../../fixtures/payment/creditcardPayment.json'
import digitalPayment from '../../../fixtures/payment/digitalPayment.json'
import TestFilter from '../../../support/TestFilter'
import storeSearchBody from '../../../fixtures/checkout/storeSearch.json'
import '../../../support/login/api/commands/login'
import '../../../support/search/api/commands/search'
import '../../../support/fulfilment/api/commands/fulfilment'
import '../../../support/sideCart/api/commands/clearTrolley'
import '../../../support/sideCart/api/commands/addItemsToTrolley'
import '../../../support/checkout/api/commands/navigateToCheckout'
import '../../../support/checkout/api/commands/confirmOrder'
import '../../../support/payment/api/commands/creditcard'
import '../../../support/payment/api/commands/digitalPayment'
import '../../../support/delivery/api/commands/options'
import '../../../support/address/api/commands/searchSetValidateAddress'
import '../../../support/login/ui/commands/login'
import '../../../support/checkout/api/commands/checkoutHelper'
import { MyOrderPage } from '../../../support/myOrder/ui/pageObjects/MyOrderPage'
import { fulfilmentType } from '../../../fixtures/checkout/fulfilmentType'
import { windowType } from '../../../fixtures/checkout/fulfilmentWindowType'
import { onOrderDetailsPage } from '../../../support/myOrder/ui/pageObjects/OrderDetailsPage'
import { onSideCartPage } from '../../../support/sideCart/ui/pageObjects/SideCartPage'
import { onCheckoutPage } from '../../../support/checkout/ui/pageObjects/CheckoutPage'
import { onOrderConfirmationPage } from '../../../support/orderConfirmation/ui/pageObjects/OrderConfirmationPage'
import { onSearchResultsPage } from '../../../support/search/ui/pageObjects/SearchResultsPage'

const searchTerm = 'pantry'
const trolleyThreshold = 30.0
const platform = Cypress.env('b2bPlatform')

TestFilter(['B2B', 'UI', 'P0'], () => {
  describe('[UI] Place a pickup order in B2B with credit card Payment and amend the order', () => {
    // pre-requisite to clear all cookies before login
    before(() => {
      cy.clearCookies({ domain: null })
      cy.clearLocalStorage({ domain: null })
    })
    it('Should place a pickup order on Woolworths at Work website using Credit Card as payment option and amend the order', () => {
      cy.loginViaApi(shopper).then((response: any) => {
        expect(response).to.have.property('LoginResult', 'Success')
      })

      cy.searchDeliveryAddress(addressSearchBody).then((response: any) => {
        expect(response.Id).to.not.be.empty

        expect(response.Id).to.not.be.null
      })

      cy.searchPickupDTBStores(
        fulfilmentType.PICK_UP,
        storeSearchBody.postCode
      ).then((response: any) => {
        expect(response.AddressId).to.not.be.null
      })

      cy.getFulfilmentWindowViaApi(windowType.PICK_UP).then((response: any) => {
        expect(response.Id).to.be.greaterThan(0)
      })

      cy.completeWindowFulfilmentViaApi().then((response: any) => {
        if (!response.IsSuccessful) {
          cy.completeWindowFulfilmentViaApi().then((newResponse: any) => {
            expect(newResponse).to.have.property('IsSuccessful', true)
          })
        }
      })

      cy.clearTrolley().then((response: any) => {
        expect(response).to.have.property('TrolleyItemCount', 0)

        expect(response).to.have.property('TotalTrolleyItemQuantity', 0)
      })

      cy.addAvailableNonRestrictedPriceLimitedWowItemsToTrolley(
        searchTerm,
        trolleyThreshold
      )

      cy.navigateToCheckout().then((response: any) => {
        expect(response.Model.Order.BalanceToPay).to.be.greaterThan(0)

        digitalPayment.payments[0].amount = response.Model.Order.BalanceToPay
      })

      cy.placeOrderViaApiWithAddedCreditCard(platform, creditCardPayment).then(
        (confirmOrderResponse: any) => {
          // Save the Order Id of the order placed
          const orderId = confirmOrderResponse.Order.OrderId
          cy.wait(3000)

          // Navigate to UI - My order page
          cy.visit('/shop/myaccount/myorders')
          cy.reload()
          cy.wait(500)

          // Passing the orderId to the Page object constructor
          const onMyOrderPage = new MyOrderPage(orderId)

          // Get to the Order details on My Orders page and Change the order
          onMyOrderPage.getMyOrderNumber().should('contain', orderId)
          onMyOrderPage.getViewOrderDetailsLink().click()
          onOrderDetailsPage.getChangeOrderButton().click()
          onOrderDetailsPage.getMyOrderModalCheckbox().then((checkbox) => {
            cy.wrap(checkbox)
              .should('not.be.visible')
              .check({ force: true })
              .should('be.checked')
          })
          onOrderDetailsPage
            .getChangeMyOrderModalButton()
            .should('contain', 'Change my order')
            .click({ force: true })
          // cy.wait(500)

          onSideCartPage.getAvailableProductsInCartPanel().should('be.visible')

          // check cart if any items are under any notifications and remove them
          onSideCartPage
            .getCloseSideCartButton()
            .click({ force: true, multiple: true })
          onSideCartPage.removeAllItemsUnderNotificationGroupsFromCart()

          // Increase the Order total by adding more products to cart
          onSearchResultsPage.searchAndAddAvailableWowItemsToCartUntilReachMinSpendThreshold(
            'pantry',
            50,
            'Aisle'
          )

          onSideCartPage.getViewCartButton().click()

          cy.intercept('api/v3/ui/fulfilment/windows?*').as('fulfilmentWindow')

          onSideCartPage.getTotalAmountElement().then((totalAmount) => {
            cy.wrap(totalAmount.text()).as('expectedTotalAmount')
          })

          onSideCartPage.gotoCheckout()

          cy.wait('@fulfilmentWindow')

          const expectedTotalAmountAlias = 'expectedTotalAmount'

          onCheckoutPage.onCheckoutPaymentPanel
            .getPaymentTotalAmountElement()
            .then((totalAmount) => {
              cy.wrap(totalAmount.text()).as(expectedTotalAmountAlias)
            })

          onCheckoutPage.onCheckoutPaymentPanel.payWithExistingCreditCard(
            '0321',
            creditCardPayment.bb
          )
          cy.wait(500)

          // Verify order confirmation page

          onOrderConfirmationPage.VerifyOrderConfirmationHeader()
          onOrderConfirmationPage.VerifyTotalAmount(expectedTotalAmountAlias)
        }
      )
    })
  })
})
