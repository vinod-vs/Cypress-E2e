import shoppers from '../../../fixtures/promotionEngines/shoppers.json'
import promotions from '../../../fixtures/promotionEngines/promotions.json'
import '../../../support/login/api/commands/login'
import '../../../support/sideCart/api/commands/clearTrolley'
import '../../../support/sideCart/api/commands/addItemsToTrolley'
import TestFilter from '../../../support/TestFilter'

TestFilter(['PES-API'], () => {
  describe('[API] Verify Classic Product Promotions', () => {
    before(() => {
      cy.clearCookies({ domain: null })
      cy.clearLocalStorage({ domain: null })
    })

    it('Verify the Classic Product promotion price is applied for the item - $OFF', () => {
      // Login using shopper saved in the fixture and verify it's successful
      cy.loginViaApi(shoppers.PESAccount1).then((response: any) => {
        expect(response).to.have.property('LoginResult', 'Success')
      })
  
      // Set the Delivery address and add the items to Trolley
      cy.addAvailableItemsToTrolley(promotions.ClassicProductPromotions[0].stockcode.toString(),
      promotions.ClassicProductPromotions[0].Quantity).then((response:any)=> {
        expect(response.AvailableItems[0].SalePrice).to.be.eqls(promotions.ClassicProductPromotions[0].SalePrice)
        })
      })

     it('Verify the ClassicProduct promotion price is applied for the item - %OFF', () => {
        // Login using shopper saved in the fixture and verify it's successful
        cy.loginViaApi(shoppers.PESAccount1).then((response: any) => {
          expect(response).to.have.property('LoginResult', 'Success')
        })
    
        // Set the Delivery address and add the items to Trolley
        cy.addAvailableItemsToTrolley(promotions.ClassicProductPromotions[1].stockcode.toString(),
        promotions.ClassicProductPromotions[1].Quantity).then((response:any)=> {
          expect(response.AvailableItems[0].SalePrice).to.be.eqls(promotions.ClassicProductPromotions[1].SalePrice)
          })
        })

       it('Verify the ClassicProduct promotion price is applied for the item - Fixed Amount' , () => {
          // Login using shopper saved in the fixture and verify it's successful
          cy.loginViaApi(shoppers.PESAccount1).then((response: any) => {
            expect(response).to.have.property('LoginResult', 'Success')
          })
      
          // Set the Delivery address and add the items to Trolley
            cy.addAvailableItemsToTrolley(promotions.ClassicProductPromotions[2].stockcode.toString(),
            promotions.ClassicProductPromotions[2].Quantity).then((response:any)=> {
              expect(response.AvailableItems[0].SalePrice).to.be.eqls(promotions.ClassicProductPromotions[2].SalePrice)
          })
        })

        it('Verify the ClassicProduct promotion price is applied for the item - Packaged Price' , () => {
          // Login using shopper saved in the fixture and verify it's successful
          cy.loginViaApi(shoppers.PESAccount1).then((response: any) => {
            expect(response).to.have.property('LoginResult', 'Success')
          })
      
          // Set the Delivery address and add the items to Trolley
            cy.addAvailableItemsToTrolley(promotions.ClassicProductPromotions[3].stockcode.toString(),
            promotions.ClassicProductPromotions[3].Quantity).then((response:any)=> {
              expect(response.AvailableItems[0].SalePrice).to.be.eqls(promotions.ClassicProductPromotions[3].SalePrice)
          })
        })
  })
})
     