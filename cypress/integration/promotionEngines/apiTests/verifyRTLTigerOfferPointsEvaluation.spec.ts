import shoppers from '../../../fixtures/promotionEngines/shoppers.json'
import promotions from '../../../fixtures/promotionEngines/promotions.json'
import '../../../support/login/api/commands/login'
import '../../../support/sideCart/api/commands/clearTrolley'
import '../../../support/sideCart/api/commands/viewTrolley'
import '../../../support/sideCart/api/commands/addItemsToTrolley'
import '../../../support/checkout/api/commands/navigateToCheckout'
import TestFilter from '../../../support/TestFilter'

TestFilter(['B2C','PES','API'], () => {

  describe('[API] Verify RTL Tiger Offer Points', () => {
    before(() => {
      cy.clearCookies({ domain: null })
      cy.clearLocalStorage({ domain: null })
    })

    beforeEach(()=>{
      // Login using shopper saved in the fixture and verify it's successful
      cy.loginViaApi(shoppers.PESAccount1).then((response: any) => {
        expect(response).to.have.property('LoginResult', 'Success')
        cy.validate2FALoginStatus(response, Cypress.env('otpValidationSwitch'), Cypress.env('otpStaticCode'))
      })
    })

    afterEach(()=>{
      cy.clearTrolley().then((response:any) => {
                expect(response).to.have.property('TrolleyItemCount',0)
              })
    })

    it('Verify the Tiger offer points for product with minimum Spend ', () => {
      // add the items to Trolley
      cy.addAvailableQuantityLimitedItemsToTrolley(promotions.TigerOffers[0].stockcode.toString(),<number>promotions.TigerOffers[0].minQty)

      cy.viewTrolley().then((response:any)=> {
        expect(response.WowRewardsSummary.TotalRewardsPointsEarned).to.be.eqls(promotions.TigerOffers[0].TotalRewardsPointsEarned)
      })

      cy.navigateToCheckout().then((response:any) => {
        expect(response.Model.Order.TotalRewardsPointsEarned).to.be.eqls(promotions.TigerOffers[0].TotalRewardsPointsEarned)
      })
    })

   it('Verify the Tiger offer points for product with minimum Quantity', () => {
      // add the items to Trolley
      cy.addAvailableQuantityLimitedItemsToTrolley(promotions.TigerOffers[1].stockcode.toString(),<number>promotions.TigerOffers[1].minQty)

      cy.viewTrolley().then((response:any)=> {
        expect(response.WowRewardsSummary.TotalRewardsPointsEarned).to.be.eqls(promotions.TigerOffers[1].TotalRewardsPointsEarned)
      })

      cy.navigateToCheckout().then((response:any) => {
        expect(response.Model.Order.TotalRewardsPointsEarned).to.be.eqls(promotions.TigerOffers[1].TotalRewardsPointsEarned)
      })
    })



  })
})
     