import shoppers from '../../../fixtures/promotionEngines/shoppers.json'
import promotions from '../../../fixtures/promotionEngines/promotions.json'
import '../../../support/login/api/commands/login'
import '../../../support/sideCart/api/commands/clearTrolley'
import '../../../support/sideCart/api/commands/addItemsToTrolley'
import '../../../support/checkout/api/commands/navigateToCheckout'
import TestFilter from '../../../support/TestFilter'




TestFilter(['B2C','PES','API'], () => {

  describe('[API] Verify Deferred Spend Stretch product Promotions', () => {
    before(() => {
      cy.clearCookies({ domain: null })
      cy.clearLocalStorage({ domain: null })
    })

    beforeEach(()=>{
      // Login using shopper saved in the fixture and verify it's successful
      cy.loginViaApi(shoppers.PESAccount1).then((response: any) => {
        cy.validate2FALoginStatus(response, Cypress.env('otpValidationSwitch'), Cypress.env('otpStaticCode'))
      })
    })

    afterEach(()=>{
      cy.clearTrolley().then((response:any) => {
                expect(response).to.have.property('TrolleyItemCount',0)
              })
    })

    it('Verify the Deferred Spend Stretch product promotion is applied on the specified SAP Category - $OFF', () => {
      
      // add the items to Trolley and do checkout
      
      cy.addAvailableQuantityLimitedItemsToTrolley(promotions.DeferredSpendStretchPromotions[0].stockcode.toString(),promotions.DeferredSpendStretchPromotions[0].Quantity).then((response:any)=> {
      expect(response.WowRewardsSummary.TotalRewardsPointsEarned).to.be.eqls(promotions.DeferredSpendStretchPromotions[0].TotalRewardsPointsEarned)
      })
       cy.navigateToCheckout().then((response:any) => {
        expect(response.Model.Order.TotalRewardsPointsEarned).to.be.eqls(promotions.DeferredSpendStretchPromotions[0].TotalRewardsPointsEarned)
       })
    }) 

    it('Verify the Deferred Spend Stretch product promotion is applied on the specified SAP Category - %OFF', () => {
      
      //  add the items to Trolley and do checkout

      cy.addAvailableQuantityLimitedItemsToTrolley(promotions.DeferredSpendStretchPromotions[1].stockcode.toString(),promotions.DeferredSpendStretchPromotions[1].Quantity).then((response:any)=> {
        expect(response.WowRewardsSummary.TotalRewardsPointsEarned).to.be.eqls(promotions.DeferredSpendStretchPromotions[1].TotalRewardsPointsEarned)
        })
       cy.navigateToCheckout().then((response:any) => {
        expect(response.Model.Order.TotalRewardsPointsEarned).to.be.eqls(promotions.DeferredSpendStretchPromotions[1].TotalRewardsPointsEarned)
       })
    }) 
    })
 })
     