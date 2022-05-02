import shoppers from '../../../../fixtures/promotionEngines/shoppers.json'
import promotions from '../../../../fixtures/promotionEngines/promotions.json'
import '../../../../support/login/api/commands/login'
import '../../../../support/sideCart/api/commands/clearTrolley'
import '../../../../support/sideCart/api/commands/addItemsToTrolley'
import '../../../../support/checkout/api/commands/navigateToCheckout'
import TestFilter from '../../../../support/TestFilter'

TestFilter(['B2C', 'PES', 'API', 'P1', 'OHNO'], () => {

  describe('[API] Verify Order Promotions', () => {
    before(() => {
      cy.clearCookies({ domain: null })
      cy.clearLocalStorage({ domain: null })
    })

    beforeEach(() => {
      // Login using shopper saved in the fixture and verify it's successful
      cy.loginViaApi(shoppers.PESBusinessAccount2).then((response: any) => {
        //cy.validate2FALoginStatus(response, Cypress.env('otpValidationSwitch'), Cypress.env('otpStaticCode'))
      })
    })

    afterEach(() => {
      cy.clearTrolley().then((response: any) => {
        expect(response).to.have.property('TrolleyItemCount', 0)
      })
    })

    it('Verify the Deferred order promotion is applied and added the reward points- $OFF', () => {

      // add the items to Trolley and do checkout
      cy.addAvailableQuantityLimitedItemsToTrolley(promotions.DeferredOrderPromotions[0].stockcode, (promotions.DeferredOrderPromotions[0].Quantity)).then((response: any) => {
        const TotalRewardPoints = ((response.Totals.SubTotal) + (promotions.DeferredOrderPromotions[0].TotalRewardsPointsEarned))
        expect(response.WowRewardsSummary.TotalRewardsPointsEarned).to.be.eqls(TotalRewardPoints)
      })
      cy.navigateToCheckout().then((response: any) => {
        promotions.DeferredOrderPromotions[0].TotalRewardsPointsEarned = promotions.DeferredOrderPromotions[0].TotalRewardsPointsEarned + (response.Model.Order.Subtotal)
        expect(response.Model.Order.TotalRewardsPointsEarned).to.be.eqls(promotions.DeferredOrderPromotions[0].TotalRewardsPointsEarned)
      })
    })

    it('Verify the Deferred order promotion is applied on earning Container Credits', () => {

      // add the items to Trolley and do checkout

      cy.addAvailableQuantityLimitedItemsToTrolley(promotions.DeferredOrderPromotions[0].stockcode.toString(), promotions.DeferredOrderPromotions[0].Quantity).then((response: any) => {
        expect(response.WowRewardsSummary.RewardsCredits.BeingEarned).to.be.eqls(promotions.DeferredOrderPromotions[0].BeingEarned)

      })
      cy.navigateToCheckout().then((response: any) => {
        expect(response.Model.Order.RewardsCredits.BeingEarned).to.be.eqls(promotions.DeferredOrderPromotions[0].BeingEarned)
      })
    })

  })
})
