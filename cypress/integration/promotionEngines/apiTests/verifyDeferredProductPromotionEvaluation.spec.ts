import shoppers from '../../../fixtures/promotionEngines/shoppers.json'
import promotions from '../../../fixtures/promotionEngines/promotions.json'
import '../../../support/login/api/commands/login'
import '../../../support/sideCart/api/commands/clearTrolley'
import '../../../support/sideCart/api/commands/addItemsToTrolley'
import TestFilter from '../../../support/TestFilter'

TestFilter(['B2C', 'PES', 'API', 'P1', 'OHNO'], () => {
  describe('[API] Verify Deferred Product Promotions', () => {
    before(() => {
      cy.clearCookies({ domain: null })
      cy.clearLocalStorage({ domain: null })
    })

    beforeEach(() => {
      // Login using shopper saved in the fixture and verify it's successful
      cy.loginViaApiWith2FA(shoppers.PESAccount1, Cypress.env('otpValidationSwitch'), Cypress.env('otpStaticCode'))
    })

    afterEach(() => {
      cy.clearTrolley().then((response: any) => {
        expect(response).to.have.property('TrolleyItemCount', 0)
      })
    })

    it('Verify the Deferred Product promotion is applied for a Stockcode ', () => {
      // Set the Delivery address and add the items to Trolley
      cy.addAvailableQuantityLimitedItemsToTrolley(promotions.DeferredProductPromotions[0].stockcode.toString(), promotions.DeferredProductPromotions[0].Quantity).then((response: any) => {
        expect(response.WowRewardsSummary.TotalRewardsPointsEarned).to.be.eqls(promotions.DeferredProductPromotions[0].TotalRewardsPointsEarned)
      })
    })

    it('Verify the Deferred Product promotion is applied for a Product Group ', () => {
      // Set the Delivery address and add the items to Trolley
      cy.addAvailableQuantityLimitedItemsToTrolley(promotions.DeferredProductPromotions[1].stockcode.toString(), promotions.DeferredProductPromotions[1].Quantity).then((response: any) => {
        expect(response.WowRewardsSummary.TotalRewardsPointsEarned).to.be.eqls(promotions.DeferredProductPromotions[1].TotalRewardsPointsEarned)
      })
    })

    it('Verify the Deferred Product promotion is applied for a EverydayMarket Product ', () => {
      // Set the Delivery address and add the items to Trolley
      cy.addAvailableQuantityLimitedItemsToTrolley(promotions.DeferredProductPromotions[2].stockcode.toString(), promotions.DeferredProductPromotions[2].Quantity).then((response: any) => {
        expect(response.WowRewardsSummary.TotalRewardsPointsEarned).to.be.eqls(promotions.DeferredProductPromotions[2].TotalRewardsPointsEarned)
      })
    })
  })
})
