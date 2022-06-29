import TestFilter from '../../../../support/TestFilter'
import shopperNote from '../../../../fixtures/checkout/productNote.json'
import '../../../../support/login/api/commands/login'
import '../../../../support/sideCart/api/commands/addItemsToTrolley'
import '../../../../support/checkout/api/commands/productNote'

TestFilter(['B2C', 'API', 'SPUD', 'Checkout'], () => {
  describe('[API] Set Product Note for items added to Trolley', () => {
    beforeEach(() => {
      cy.clearCookies({ domain: null })
      cy.clearLocalStorage({ domain: null })
      cy.loginWithNewShopperViaApi()
    })

    it('Should add a product note for an item in the trolley', () => {
      cy.addAvailableNonRestrictedItemCountLimitedWowItemsToTrolley(
        'Bread',
        2
      ).then((response: any) => {
        shopperNote.Stockcode = response[0].stockcode
        shopperNote.ProductNote = 'Product Note added via API'
      })

      cy.addProductNoteViaApi(shopperNote).then((response: any) => {
        expect(response.ErrorMessage, 'Error Message on post to /ProductNote')
          .to.be.empty
      })
    })
  })
})
