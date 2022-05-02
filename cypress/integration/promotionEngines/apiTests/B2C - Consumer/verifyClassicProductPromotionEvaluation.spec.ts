import shoppers from '../../../../fixtures/promotionEngines/shoppers.json'
import promotions from '../../../../fixtures/promotionEngines/promotions.json'
import '../../../../support/login/api/commands/login'
import '../../../../support/sideCart/api/commands/clearTrolley'
import '../../../../support/sideCart/api/commands/addItemsToTrolley'
import TestFilter from '../../../../support/TestFilter'



TestFilter(['B2C', 'PES', 'API', 'P1', 'OHNO'], () => {

  describe('[API] Verify Classic Product Promotions', () => {
    before(() => {
      cy.clearCookies({ domain: null })
      cy.clearLocalStorage({ domain: null })
    })

    beforeEach(() => {
      // Login using shopper saved in the fixture and verify it's successful
      cy.loginViaApi(shoppers.PESAccount2).then((response: any) => {
        cy.validate2FALoginStatus(response, Cypress.env('otpValidationSwitch'), Cypress.env('otpStaticCode'))
      })
    })

    afterEach(() => {
      cy.clearTrolley().then((response: any) => {
        expect(response).to.have.property('TrolleyItemCount', 0)
      })
    })

    it('Verify the Classic Product promotion price is applied for the item - $OFF', () => {


      // Set the Delivery address and add the items to Trolley
      cy.addAvailableQuantityLimitedItemsToTrolley(promotions.ClassicProductPromotions[0].stockcode.toString(), promotions.ClassicProductPromotions[0].Quantity).then((response: any) => {
        expect(response.AvailableItems[0].SalePrice).to.be.eqls(promotions.ClassicProductPromotions[0].SalePrice)
      })
    })

    it('Verify the ClassicProduct promotion price is applied for the item - %OFF', () => {

      // Set the Delivery address and add the items to Trolley
      cy.addAvailableQuantityLimitedItemsToTrolley(promotions.ClassicProductPromotions[1].stockcode.toString(), promotions.ClassicProductPromotions[1].Quantity).then((response: any) => {
        expect(response.AvailableItems[0].SalePrice).to.be.eqls(promotions.ClassicProductPromotions[1].SalePrice)
      })
    })

    it('Verify the ClassicProduct promotion price is applied for the item - Fixed Amount', () => {

      // Set the Delivery address and add the items to Trolley
      cy.addAvailableQuantityLimitedItemsToTrolley(promotions.ClassicProductPromotions[2].stockcode.toString(), promotions.ClassicProductPromotions[2].Quantity).then((response: any) => {
        expect(response.AvailableItems[0].SalePrice).to.be.eqls(promotions.ClassicProductPromotions[2].SalePrice)
      })
    })

    it('Verify the ClassicProduct promotion price is applied for the item - Package Price', () => {

      // Set the Delivery address and add the items to Trolley
      cy.addAvailableQuantityLimitedItemsToTrolley(promotions.ClassicProductPromotions[3].stockcode.toString(), promotions.ClassicProductPromotions[3].Quantity).then((response: any) => {
        expect(response.AvailableItems[0].SalePrice).to.be.eqls(promotions.ClassicProductPromotions[3].SalePrice)
      })
    })

    it('Verify the ClassicProduct promotion price is applied for the item - ProductGroup - $OFF', () => {

      // Set the Delivery address and add the items to Trolley
      cy.addAvailableQuantityLimitedItemsToTrolley(promotions.ClassicProductPromotions[4].stockcode.toString(), promotions.ClassicProductPromotions[4].Quantity).then((response: any) => {
        expect(response.AvailableItems[0].SalePrice).to.be.eqls(promotions.ClassicProductPromotions[4].SalePrice)
      })
      cy.addAvailableQuantityLimitedItemsToTrolley(promotions.ClassicProductPromotions[5].stockcode.toString(), promotions.ClassicProductPromotions[5].Quantity).then((response: any) => {
        expect(response.AvailableItems[0].SalePrice).to.be.eqls(promotions.ClassicProductPromotions[5].SalePrice)
      })
    })
  })

})
