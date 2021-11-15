import shoppers from '../../../fixtures/promotionEngines/shoppers.json'
import search from '../../../fixtures/promotionEngines/search.json'
import '../../../support/login/api/commands/login'
import '../../../support/sideCart/api/commands/clearTrolley'
import '../../../support/sideCart/api/commands/addItemsToTrolley'
import TestFilter from '../../../support/TestFilter'

const searchTerm = '192674'
const platform = Cypress.env('b2cPlatform')

TestFilter(['B2C-API'], () => {
  describe('[API] Verify Classic Product Promotions', () => {
    before(() => {
      cy.clearCookies({ domain: null })
      cy.clearLocalStorage({ domain: null })
    })


    it('Verify the ClassicProduct promotion price is applied for the item', () => {
      // Login using shopper saved in the fixture and verify it's successful
      cy.loginViaApi(shoppers.PESAccount1).then((response: any) => {
        expect(response).to.have.property('LoginResult', 'Success')
      })
  
      // Set the Delivery address and add the items to Trolley
      cy.addAvailableNonRestrictedWowItemsToTrolley(search.stockcode).then((response:any)=> {
        expect(response.AvailableItems[0].SalePrice.toString()).to.be.eqls(search.SalePrice)
        })
        
      })
    })
  
})
     