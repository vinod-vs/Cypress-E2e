import TestFilter from '../../../support/TestFilter'
import addressSearchBody from '../../../fixtures/checkout/addressSearch.json'
import removeItemsRequestBody from '../../../fixtures/sideCart/removeItems.json'
import { fulfilmentType } from '../../../fixtures/checkout/fulfilmentType'
import { windowType } from '../../../fixtures/checkout/fulfilmentWindowType'
import '../../../support/sideCart/api/commands/addItemsToTrolley'
import '../../../support/orders/api/commands/cancelOrder'
import '../../../support/login/api/commands/login'
import '../../../support/fulfilment/api/commands/fulfilment'
import '../../../support/checkout/api/commands/checkoutHelper'
import '../../../support/orders/api/commands/amendOrder'
import '../../../support/shared/api/commands/bootstrap'
import '../../../support/payment/api/commands/zero'

TestFilter(['B2C', 'API', 'SPUD', 'E2E'], () => {
  const searchTerm = 'Freezer'
  const additionalSearchTerm = 'Fish'
  const trolleyThreshold = 50.0
  const platform = Cypress.env('b2cPlatform')

  describe('[API] Amend placed order for B2C customer', () => {
    beforeEach(() => {
      cy.clearCookies({ domain: null })
      cy.clearLocalStorage({ domain: null })
      cy.loginWithNewShopperViaApi()
      cy.setFulfilmentLocationWithWindow(
        fulfilmentType.DELIVERY,
        addressSearchBody.search,
        windowType.FLEET_DELIVERY
      )
      cy.addAvailableNonRestrictedPriceLimitedWowItemsToTrolley(
        searchTerm,
        trolleyThreshold
      )
      cy.addAvailableNonRestrictedPriceLimitedWowItemsToTrolley(
        additionalSearchTerm,
        trolleyThreshold
      )

      cy.placeOrderViaApiWithAddedCreditCard(platform).then(
        (confirmOrderResponse: any) => {
          cy.wrap(confirmOrderResponse.Order.OrderId).as('initialOrderId')
          cy.wrap(confirmOrderResponse.Order.TotalIncludingGst).as(
            'initialOrderTotal'
          )
        }
      )

      cy.get('@initialOrderId').then(($orderId: any) => {
        cy.amendOrder($orderId).then((response: any) => {
          expect(response.Success, 'Amend Initiation Successful').to.be.true
          cy.getCurrentlyAmendingOrder().then((order: any) => {
            expect(order.OrderId, 'Currently Amending Order').to.equal($orderId)
            expect(order.AmendCutoffTime, 'Amend Cut off time').to.not.be.empty
          })
        })
      })
      removeUnavailableStockCodes()
    })

    it('Should place an order for B2C customer, then amend the order and place amended order with additional order total', () => {
      cy.wait(60000)
      cy.addAvailableNonRestrictedPriceLimitedWowItemsToTrolley('Pet', 30.0)

      cy.getBootstrapResponse().then(($response: any) => {
        cy.get('@initialOrderTotal').then((initialTotal: any) => {
          expect(
            $response.TrolleyRequest.Totals.Total,
            'Amended Order Total'
          ).to.be.greaterThan(initialTotal)
        })
      })

      cy.placeOrderViaApiWithAddedCreditCard(platform).then((response: any) => {
        expect(response.Order.OrderId, 'Order ID').to.not.be.null
        expect(response.Order.OrderStatus, 'Order Status').to.equal('Placed')
        expect(response.Order.AmendCutoff, 'Amend Cutoff Time').to.not.be.empty
      })
    })

    it('Should place an order for B2C customer, then amend the order and place amended order with the same or reduced total value', () => {
      cy.wait(60000)
      cy.zero().then((response: any) => {
        expect(response.Result, 'Zero Amend Request Result').to.eql(true)
        expect(response.PlacedOrderId, 'Placed Order ID').to.not.be.null
        expect(response.OrderReference, 'Order Reference').to.not.be.empty
      })
    })

    it('Should cancel amendment of an order for B2C customer', () => {
      cy.getCurrentlyAmendingOrder().then(($order: any) => {
        cy.cancelAmendingOrder($order.OrderId, true).then(() => {
          cy.getCurrentlyAmendingOrder().then((response: any) => {
            expect(response.OrderId, 'Amending Order Id').to.be.null
          })
        })
      })
    })

    // Workaround for issue on UAT whereby products from initial order become unavailable on starting an amendment
    function removeUnavailableStockCodes() {
      cy.getUnavailableStockCodes().then((stockCodes: any) => {
        if (stockCodes.length > 0) {
          cy.removeItems({ ...removeItemsRequestBody, StockCodes: stockCodes })
        }
      })
    }
  })
})
