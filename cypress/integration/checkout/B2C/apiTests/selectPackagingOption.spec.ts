import TestFilter from '../../../../support/TestFilter'
import { PackagingOptions } from '../../../../fixtures/packaging/packagingPreferences'
import { fulfilmentType } from '../../../../fixtures/checkout/fulfilmentType'
import { windowType } from '../../../../fixtures/checkout/fulfilmentWindowType'
import addressSearchBody from '../../../../fixtures/checkout/addressSearch.json'
import '../../../../support/fulfilment/api/commands/fulfilment'
import '../../../../support/login/api/commands/login'
import '../../../../support/packaging/api/packagingPreferences'
import '../../../../support/sideCart/api/commands/addItemsToTrolley'

TestFilter(['API', 'B2C', 'Checkout', 'P2', 'SPUD'], () => {
  describe('[API] Select a Packaging Option', () => {
    before(() => {
      cy.clearCookies({ domain: null })
      cy.clearLocalStorage({ domain: null })
      cy.loginWithNewShopperViaApi()
    })

    it('Should select a packaging option for a Delivery (without Order placement)', () => {
      cy.setFulfilmentLocationWithWindow(
        fulfilmentType.DELIVERY,
        addressSearchBody.search,
        windowType.FLEET_DELIVERY
      )
      cy.addAvailableNonRestrictedPriceLimitedWowItemsToTrolley('Bread', 50.0)
      cy.setPackagingOption(PackagingOptions.ReusableBags).then(
        (response: any) => {
          const packagingSelection = response.PackagingPreferences.filter(
            (preference: any) =>
              preference.Code === PackagingOptions.ReusableBags
          )
          expect(packagingSelection.length, 'Packaging Selection count').to.eql(
            1
          )
          expect(
            packagingSelection[0].IsSelected,
            'Is Packaging Option selected'
          ).to.eql(true)
        }
      )
    })
  })
})
