import shoppers from '../../../../fixtures/promotionEngines/shoppers.json'
import promotions from '../../../../fixtures/promotionEngines/promotions.json'
import '../../../../support/login/api/commands/login'
import '../../../../support/sideCart/api/commands/clearTrolley'
import '../../../../support/sideCart/api/commands/addItemsToTrolley'
import '../../../../support/checkout/api/commands/redeemRewardsDollars'
import TestFilter from '../../../../support/TestFilter'

TestFilter(['B2C', 'PES', 'API', 'P1', 'OHNO'], () => {

  describe('[API] Verify Product Promotions', () => {
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

    it('Verify the Product promotion price is applied for the item - $OFF', () => {
      // Set the Delivery address and add the items to Trolley
      cy.addAvailableQuantityLimitedItemsToTrolley(promotions.ProductPromotions[0].stockcode.toString(), promotions.ProductPromotions[0].Quantity).then((response: any) => {
        expect(response.AvailableItems[0].SalePrice).to.be.eqls(promotions.ProductPromotions[0].SalePrice)
      })
    })

    it('Verify the Product promotion price is applied for the item - %OFF', () => {
      // Set the Delivery address and add the items to Trolley
      cy.addAvailableQuantityLimitedItemsToTrolley(promotions.ProductPromotions[1].stockcode.toString(), promotions.ProductPromotions[1].Quantity).then((response: any) => {
        expect(response.AvailableItems[0].SalePrice).to.be.eqls(promotions.ProductPromotions[1].SalePrice)
      })
    })

    it('Verify the Product promotion price is applied for the item - Credit Discount %OFF', () => {
      // Set the Delivery address and add the items to Trolley
      cy.redeemRewardsCredits(true)
      cy.addAvailableQuantityLimitedItemsToTrolley(promotions.ProductPromotions[2].stockcode.toString(), promotions.ProductPromotions[2].Quantity).then((response: any) => {
        expect(response.AvailableItems[0].SalePrice).to.be.eqls(promotions.ProductPromotions[2].SalePrice1)
        expect(response.WowRewardsSummary.RewardsCredits.BeingRedeemed).to.be.eqls(promotions.ProductPromotions[2].CreditsUsed1)
      })
      cy.clearTrolley()
      cy.redeemRewardsCredits(false)
      cy.addAvailableQuantityLimitedItemsToTrolley(promotions.ProductPromotions[2].stockcode.toString(), promotions.ProductPromotions[2].Quantity).then((response: any) => {
        expect(response.AvailableItems[0].SalePrice).to.be.eqls(promotions.ProductPromotions[2].SalePrice2)
        expect(response.WowRewardsSummary.RewardsCredits.BeingRedeemed).to.be.eqls(promotions.ProductPromotions[2].CreditsUsed2)
      })

    })
  })
})
