import shoppers from '../../../fixtures/promotionEngines/shoppers.json'
import promotions from '../../../fixtures/promotionEngines/promotions.json'
import '../../../support/login/api/commands/login'
import '../../../support/sideCart/api/commands/clearTrolley'
import '../../../support/sideCart/api/commands/addItemsToTrolley'
import '../../../support/checkout/api/commands/navigateToCheckout'
import TestFilter from '../../../support/TestFilter'

TestFilter(['B2C','PES','API'], () => {

  describe('[API] Verify Coupon Promotions', () => {
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

    it('Verify the Coupon promotion is applied on the grocery subtotal - $OFF and delivery Fee - $OFF', () => {
      
      // Set the Delivery address and add the items to Trolley
      cy.addAvailableNonRestrictedPriceLimitedWowItemsToTrolley(promotions.OrderPromotions[1].searchTerm,(promotions.OrderPromotions[1].Subtotal))
      cy.navigateToCheckout().then((response:any) => {
        expect(response.Model.Order.Subtotal).to.be.greaterThan(promotions.OrderPromotions[1].Subtotal)
        // const SubTotaloff = ((response.Model.Order.Subtotal) * 0.1) + (promotions.OrderPromotions[1].OrderDiscountWithoutTeamDiscount)
        expect(response.Model.Order).to.have.property('OrderDiscountWithoutTeamDiscount',(promotions.OrderPromotions[1].OrderDiscountWithoutTeamDiscount))
        expect(response.Model.Order).to.have.property('DeliveryFeeDiscount',(promotions.OrderPromotions[1].DeliveryFeeDiscount))
      })
    })

    it('Verify the Order promotion is applied on the grocery subtotal - %OFF and delivery Fee - %OFF', () => {
      // Set the Delivery address and add the items to Trolley
      cy.addAvailableNonRestrictedPriceLimitedWowItemsToTrolley(promotions.OrderPromotions[0].searchTerm,(promotions.OrderPromotions[0].Subtotal))
      cy.navigateToCheckout().then((response:any) => {
        const SubTotaloff = ((response.Model.Order.Subtotal) * 0.1) + (promotions.OrderPromotions[1].OrderDiscountWithoutTeamDiscount)
        // const DeliveryOFF = (response.Model.Order.DeliveryFeeBeforeDiscount)*0.1
        expect(response.Model.Order.Subtotal).to.be.greaterThan(promotions.OrderPromotions[0].Subtotal)
        expect(response.Model.Order).to.have.property('OrderDiscountWithoutTeamDiscount',SubTotaloff)
        expect(response.Model.Order).to.have.property('DeliveryFeeDiscount',(promotions.OrderPromotions[1].DeliveryFeeDiscount))
      })
    })

    it('Verify the Order promotion is applied on the Everyday market Delivery Fee - %OFF', () => {
      // Set the Delivery address and add the items to Trolley
      cy.addAvailableEDMItemsToTrolley(promotions.OrderPromotions[2].stockcode.toString(),4)
      cy.navigateToCheckout().then((response:any) => {
        expect(response.Model.Order.MarketShippingFees).to.have.property('MarketShippingFeeBeforeDiscount',(promotions.OrderPromotions[2].MarketShippingFeeBeforeDiscount))
        expect(response.Model.Order.MarketShippingFees).to.have.property('MarketShippingFeeDiscount',(promotions.OrderPromotions[2].MarketShippingFeeDiscount))
      })
    })
  })
})
     