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

    it('Verify the Coupon promotion is applied on the grocery subtotal - %OFF and Delivery Fee - % OFF', () => {
      
      // Set the Delivery address and add the items to Trolley
      cy.addAvailableQuantityLimitedItemsToTrolley(promotions.CouponPromotions[0].searchTerm, <number>promotions.CouponPromotions[0].Quantity)
      cy.navigateToCheckout().then((response:any)=>{
        expect(response.Model.Order.Subtotal).to.be.greaterThan(0)
      })

       //Order Discount - %OFF
      cy.addPromotionCode(promotions.CouponPromotions[0].SubtotalCouponCodePercentOFF).then((response:any)=>{
        const orderDiscount = parseFloat(((response.Model.Order.Subtotal)*promotions.CouponPromotions[0].PercentOFF).toFixed(2))
        expect(response.Model.Order.Discounts[0].Amount).to.be.eqls(orderDiscount)
        expect(response.Model.Order.Discounts[0].DiscountSourceId).to.be.eqls(promotions.CouponPromotions[0].SubtotalCouponCodePercentOFF)
        expect(response.Model.Order.Discounts[0].Source).to.be.eqls('Coupon')
        expect(response.Model.Order.Discounts[0].Target).to.be.eqls('Subtotal')
        expect(response.Model.Order.OrderDiscountWithoutTeamDiscount).to.be.eqls(orderDiscount)
      })

      cy.removePromotionCode(promotions.CouponPromotions[0].SubtotalCouponCodePercentOFF).then((response:any)=>{
        expect(response.Model.Order.OrderDiscountWithoutTeamDiscount).to.be.eqls(0)
      })

      //Delivery Fee Discount - %OFF
      cy.addPromotionCode(promotions.CouponPromotions[0].DeliveryFeeCouponCodePercentOFF).then((response:any)=>{
        const deliveryFeeDiscount = parseFloat(((response.Model.Order.DeliveryFeeBeforeDiscount)*promotions.CouponPromotions[0].PercentOFF).toFixed(2))
        expect(response.Model.Order.Discounts[0].Amount).to.be.eqls(deliveryFeeDiscount)
        expect(response.Model.Order.Discounts[0].DiscountSourceId).to.be.eqls(promotions.CouponPromotions[0].DeliveryFeeCouponCodePercentOFF)
        expect(response.Model.Order.Discounts[0].Source).to.be.eqls('Coupon')
        expect(response.Model.Order.Discounts[0].Target).to.be.eqls('DeliveryFee')
        expect(response.Model.Order.DeliveryFeeDiscount).to.be.eqls(deliveryFeeDiscount)
      })
      cy.removePromotionCode(promotions.CouponPromotions[0].DeliveryFeeCouponCodePercentOFF).then((response:any)=>{
        expect(response.Model.Order.DeliveryFeeDiscount).to.be.eqls(0)
      })

       //Order Discount - %OFF
       cy.addPromotionCode(promotions.CouponPromotions[0].SubtotalCouponCodeDollarOFF).then((response:any)=>{
        const orderDiscount = promotions.CouponPromotions[0].DollarOFF
        expect(response.Model.Order.Discounts[0].Amount).to.be.eqls(orderDiscount)
        expect(response.Model.Order.Discounts[0].DiscountSourceId).to.be.eqls(promotions.CouponPromotions[0].SubtotalCouponCodeDollarOFF)
        expect(response.Model.Order.Discounts[0].Source).to.be.eqls('Coupon')
        expect(response.Model.Order.Discounts[0].Target).to.be.eqls('Subtotal')
        expect(response.Model.Order.OrderDiscountWithoutTeamDiscount).to.be.eqls(orderDiscount)
      })

      cy.removePromotionCode(promotions.CouponPromotions[0].SubtotalCouponCodeDollarOFF).then((response:any)=>{
        expect(response.Model.Order.OrderDiscountWithoutTeamDiscount).to.be.eqls(0)
      })

      //Delivery Fee Discount - $OFF
      cy.addPromotionCode(promotions.CouponPromotions[0].DeliveryFeeCouponCodeDollarOFF).then((response:any)=>{
        const deliveryFeeDiscount = promotions.CouponPromotions[0].DollarOFF
        expect(response.Model.Order.Discounts[0].Amount).to.be.eqls(deliveryFeeDiscount)
        expect(response.Model.Order.Discounts[0].DiscountSourceId).to.be.eqls(promotions.CouponPromotions[0].DeliveryFeeCouponCodeDollarOFF)
        expect(response.Model.Order.Discounts[0].Source).to.be.eqls('Coupon')
        expect(response.Model.Order.Discounts[0].Target).to.be.eqls('DeliveryFee')
        expect(response.Model.Order.DeliveryFeeDiscount).to.be.eqls(deliveryFeeDiscount)
      })
      cy.removePromotionCode(promotions.CouponPromotions[0].DeliveryFeeCouponCodeDollarOFF).then((response:any)=>{
        expect(response.Model.Order.DeliveryFeeDiscount).to.be.eqls(0)
      })



    })

   /* it('Verify the Coupon promotion is applied on the grocery subtotal - $OFF and Delivery Fee - $ OFF and Market Shipping Fee - $OFF' , () => {
      
      // Set the Delivery address and add the items to Trolley
      cy.addAvailableNonRestrictedPriceLimitedWowItemsToTrolley(promotions.CouponPromotions[1].searchTerm,(promotions.CouponPromotions[1].Subtotal))
      cy.navigateToCheckout().then((response:any) => {
        expect(response.Model.Order.Subtotal).to.be.greaterThan(promotions.CouponPromotions[1].Subtotal)
      })

      //Order Discount
      cy.addPromotionCode(promotions.CouponPromotions[1].SubtotalCouponCode).then((response:any)=>{
        expect(response.Model.Order).to.have.property('OrderDiscountWithoutTeamDiscount',promotions.CouponPromotions[1].OrderDiscount)
      })
      cy.removePromotionCode(promotions.CouponPromotions[1].SubtotalCouponCode)

      //Delivery Fee Discount
      cy.addPromotionCode(promotions.CouponPromotions[1].DeliveryFeeCouponCode).then((response:any)=>{
        expect(response.Model.Order).to.have.property('DeliveryFeeDiscount',promotions.CouponPromotions[1].DeliveryFeeDiscount)
      })
      cy.removePromotionCode(promotions.CouponPromotions[1].DeliveryFeeCouponCode)
    })*/
  })
})
     