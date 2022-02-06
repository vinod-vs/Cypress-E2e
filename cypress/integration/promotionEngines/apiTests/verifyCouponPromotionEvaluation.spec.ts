import shoppers from '../../../fixtures/promotionEngines/shoppers.json'
import promotions from '../../../fixtures/promotionEngines/promotions.json'
import '../../../support/login/api/commands/login'
import '../../../support/sideCart/api/commands/clearTrolley'
import '../../../support/sideCart/api/commands/addItemsToTrolley'
import '../../../support/checkout/api/commands/navigateToCheckout'
import TestFilter from '../../../support/TestFilter'

TestFilter(['B2C', 'PES', 'API', 'P1', 'OHNO'], () => {

  describe('[API] Verify Coupon Promotions', () => {
    before(() => {
      cy.clearCookies({ domain: null })
      cy.clearLocalStorage({ domain: null })
    })

    beforeEach(() => {
      // Login using shopper saved in the fixture and verify it's successful
      cy.loginViaApi(shoppers.PESAccount1).then((response: any) => {
        cy.validate2FALoginStatus(response, Cypress.env('otpValidationSwitch'), Cypress.env('otpStaticCode'))
      })
    })

    afterEach(() => {
      cy.clearTrolley().then((response: any) => {
        expect(response).to.have.property('TrolleyItemCount', 0)
      })
    })

    it('Verify the Coupon promotion is applied on the grocery subtotal - %OFF & $OFF and Delivery Fee - % OFF & $OFF', () => {

      // Set the Delivery address and add the items to Trolley
      cy.addAvailableQuantityLimitedItemsToTrolley(<string>promotions.CouponPromotions[0].searchTerm, <number>promotions.CouponPromotions[0].Quantity)
      cy.navigateToCheckout().then((response: any) => {
        expect(response.Model.Order.Subtotal).to.be.greaterThan(0)
      })
      //Order Discount - %OFF
      cy.addPromotionCode(<string>promotions.CouponPromotions[0].SubtotalCouponCodePercentOFF).then((response: any) => {
        const orderDiscount = parseFloat(((response.Model.Order.Subtotal) * <number>promotions.CouponPromotions[0].PercentOFF).toFixed(2))
        expect(response.Model.Order.Discounts[0].Amount).to.be.eqls(orderDiscount)
        expect(response.Model.Order.Discounts[0].DiscountSourceId).to.be.eqls(promotions.CouponPromotions[0].SubtotalCouponCodePercentOFF)
        expect(response.Model.Order.Discounts[0].Source).to.be.eqls('Coupon')
        expect(response.Model.Order.Discounts[0].Target).to.be.eqls('Subtotal')
        expect(response.Model.Order.OrderDiscountWithoutTeamDiscount).to.be.eqls(orderDiscount)
      })

      cy.removePromotionCode(<string>promotions.CouponPromotions[0].SubtotalCouponCodePercentOFF).then((response: any) => {
        expect(response.Model.Order.OrderDiscountWithoutTeamDiscount).to.be.eqls(0)
      })

      //Delivery Fee Discount - %OFF
      cy.addPromotionCode(<string>promotions.CouponPromotions[0].DeliveryFeeCouponCodePercentOFF).then((response: any) => {
        const deliveryFeeDiscount = parseFloat(((response.Model.Order.DeliveryFeeBeforeDiscount) * <number>promotions.CouponPromotions[0].PercentOFF).toFixed(2))
        expect(response.Model.Order.Discounts[0].Amount).to.be.eqls(deliveryFeeDiscount)
        expect(response.Model.Order.Discounts[0].DiscountSourceId).to.be.eqls(promotions.CouponPromotions[0].DeliveryFeeCouponCodePercentOFF)
        expect(response.Model.Order.Discounts[0].Source).to.be.eqls('Coupon')
        expect(response.Model.Order.Discounts[0].Target).to.be.eqls('DeliveryFee')
        expect(response.Model.Order.DeliveryFeeDiscount).to.be.eqls(deliveryFeeDiscount)
      })
      cy.removePromotionCode(<string>promotions.CouponPromotions[0].DeliveryFeeCouponCodePercentOFF).then((response: any) => {
        expect(response.Model.Order.DeliveryFeeDiscount).to.be.eqls(0)
      })

      //Order Discount - %OFF
      cy.addPromotionCode(<string>promotions.CouponPromotions[0].SubtotalCouponCodeDollarOFF).then((response: any) => {
        const orderDiscount = promotions.CouponPromotions[0].DollarOFF
        expect(response.Model.Order.Discounts[0].Amount).to.be.eqls(orderDiscount)
        expect(response.Model.Order.Discounts[0].DiscountSourceId).to.be.eqls(promotions.CouponPromotions[0].SubtotalCouponCodeDollarOFF)
        expect(response.Model.Order.Discounts[0].Source).to.be.eqls('Coupon')
        expect(response.Model.Order.Discounts[0].Target).to.be.eqls('Subtotal')
        expect(response.Model.Order.OrderDiscountWithoutTeamDiscount).to.be.eqls(orderDiscount)
      })

      cy.removePromotionCode(<string>promotions.CouponPromotions[0].SubtotalCouponCodeDollarOFF).then((response: any) => {
        expect(response.Model.Order.OrderDiscountWithoutTeamDiscount).to.be.eqls(0)
      })

      //Delivery Fee Discount - $OFF
      cy.addPromotionCode(<string>promotions.CouponPromotions[0].DeliveryFeeCouponCodeDollarOFF).then((response: any) => {
        const deliveryFeeDiscount = promotions.CouponPromotions[0].DollarOFF
        expect(response.Model.Order.Discounts[0].Amount).to.be.eqls(deliveryFeeDiscount)
        expect(response.Model.Order.Discounts[0].DiscountSourceId).to.be.eqls(promotions.CouponPromotions[0].DeliveryFeeCouponCodeDollarOFF)
        expect(response.Model.Order.Discounts[0].Source).to.be.eqls('Coupon')
        expect(response.Model.Order.Discounts[0].Target).to.be.eqls('DeliveryFee')
        expect(response.Model.Order.DeliveryFeeDiscount).to.be.eqls(deliveryFeeDiscount)
      })
      cy.removePromotionCode(<string>promotions.CouponPromotions[0].DeliveryFeeCouponCodeDollarOFF).then((response: any) => {
        expect(response.Model.Order.DeliveryFeeDiscount).to.be.eqls(0)
      })
    })

    it('Verify the Coupon promotion is applied on the Market Shipping Fee - %OFF', () => {

      // Set the Delivery address and add the items to Trolley
      cy.addAvailableEDMItemsToTrolley(<string>promotions.CouponPromotions[1].searchTerm, (promotions.CouponPromotions[1].searchTerm, <number>promotions.CouponPromotions[1].Quantity))
      cy.navigateToCheckout().then((response: any) => {
        expect(response.Model.Order.MarketSubtotal).to.be.greaterThan(0)
      })

      //Market Shipping Fee Discount
      cy.addPromotionCode(<string>promotions.CouponPromotions[1].MarketShippingFeeCouponCode).then((response: any) => {
        const marketShippingFeeDiscount = parseFloat(((response.Model.Order.MarketShippingFees.MarketShippingFeeBeforeDiscount) * (<number>promotions.CouponPromotions[1].PercentOFF)).toFixed(2))
        expect(response.Model.Order.MarketShippingFees).to.have.property('MarketShippingFeeDiscount', marketShippingFeeDiscount)
      })
      cy.removePromotionCode(<string>promotions.CouponPromotions[1].MarketShippingFeeCouponCode).then((response: any) => {
        expect(response.Model.Order.MarketShippingFees.MarketShippingFeeDiscount).to.be.eqls(0)
      })
    })

    it('Verify the Coupon promotion is applied in combination with Classic Product Promotion', () => {

      // Set the Delivery address and add the items to Trolley
      cy.addAvailableQuantityLimitedItemsToTrolley(<string>promotions.CouponPromotions[2].searchTerm, <number>promotions.CouponPromotions[2].Quantity)
      cy.navigateToCheckout().then((response: any) => {
        expect(response.Model.Order.Subtotal).to.be.greaterThan(0)
      })

      //Classic Product Promotion + Coupon Promotion
      cy.addPromotionCode(<string>promotions.CouponPromotions[2].ClassicProductPromoCouponCode).then((response: any) => {
        const productDiscount = Math.round((response.Model.Order.Products[0].ListPrice - <number>promotions.CouponPromotions[2].DollarOFF) * 100) / 100
        expect(response.Model.Order.Products[0].SalePrice).to.be.eqls(productDiscount)
      })

      cy.removePromotionCode(<string>promotions.CouponPromotions[2].ClassicProductPromoCouponCode).then((response: any) => {
        expect(response.Model.Order.Products[0].SalePrice).to.be.eqls(response.Model.Order.Products[0].ListPrice)
      })
    })
  })
})
